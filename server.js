const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'doggzi-session-secret';
const ACCESS_CODE = process.env.APP_ACCESS_CODE || '3344';

const DB_DIR = path.join(__dirname, 'db');
const DB_PATH = path.join(DB_DIR, 'app.db');
const CSV_PATH = path.join(__dirname, 'data', 'Doggzi.recipes.csv');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
  })
);

let recipes = [];
let ingredients = [];
let csvLoadError = null;

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

function parseCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    csvLoadError = `Missing CSV file at ${CSV_PATH}`;
    return;
  }
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  const ingredientSet = new Set();
  recipes = records.map((row) => {
    const ingredientEntries = [];
    const optionEntries = [];
    Object.keys(row).forEach((key) => {
      const primaryMatch = key.match(/^primary_ingredients\[(\d+)\]\.ingredient$/);
      const optionMatch = key.match(/^ingredient_options\[(\d+)\]\.ingredient$/);
      if (primaryMatch && row[key]) {
        const index = primaryMatch[1];
        const percentKey = `primary_ingredients[${index}].percentage`;
        const ingredient = row[key].trim();
        const percentage = toNumber(row[percentKey], 0);
        ingredientEntries.push({ ingredient, percentage });
        ingredientSet.add(ingredient);
      }
      if (optionMatch && row[key]) {
        const index = optionMatch[1];
        const optionPercentKey = `ingredient_options[${index}].percentage`;
        optionEntries.push({
          ingredient: row[key].trim(),
          percentage: toNumber(row[optionPercentKey], 0)
        });
      }
    });

    const totalPercentage = ingredientEntries.reduce((sum, item) => sum + item.percentage, 0);
    return {
      name: row.name || 'Unnamed Recipe',
      recipe_code: row.recipe_code || row.recipeCode || row.code || `recipe-${Math.random()}`,
      recipe_type: row.recipe_type || row.recipeType || '',
      food_type: row.food_type || row.foodType || '',
      species: row.species || '',
      diet_type: row.diet_type || row.dietType || '',
      quantity_grams: toNumber(row.quantity_grams, 0),
      min_age_months: toNumber(row.min_age_months, 0),
      max_age_months: toNumber(row.max_age_months, 0),
      primary_ingredients: ingredientEntries,
      ingredient_options: optionEntries,
      total_percentage: totalPercentage,
      percentage_warning: totalPercentage < 95 || totalPercentage > 105
    };
  });
  ingredients = Array.from(ingredientSet).sort();
  csvLoadError = null;
}

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS ingredient_costs (
        ingredient_name TEXT PRIMARY KEY,
        cost_per_kg_inr REAL NOT NULL,
        updated_at TEXT NOT NULL
      )`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        recipe_code TEXT NOT NULL,
        inputs_json TEXT NOT NULL,
        results_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    );
  });
}

parseCsv();
initDb();

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', (req, res) => {
  const { accessCode } = req.body;
  if (accessCode === ACCESS_CODE) {
    req.session.authenticated = true;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid access code.' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: Boolean(req.session.authenticated) });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !['/api/login', '/api/session'].includes(req.path)) {
    if (!req.session.authenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
  return next();
});

app.get('/api/recipes', (req, res) => {
  if (csvLoadError) {
    return res.status(500).json({ error: csvLoadError });
  }
  const { species, food_type, recipe_type, search } = req.query;
  let filtered = [...recipes];
  if (species) filtered = filtered.filter((r) => r.species === species);
  if (food_type) filtered = filtered.filter((r) => r.food_type === food_type);
  if (recipe_type) filtered = filtered.filter((r) => r.recipe_type === recipe_type);
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(term) || r.recipe_code.toLowerCase().includes(term));
  }
  return res.json(filtered);
});

app.get('/api/recipes/:recipe_code', (req, res) => {
  const recipe = recipes.find((r) => r.recipe_code === req.params.recipe_code);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found.' });
  }
  return res.json(recipe);
});

app.get('/api/ingredients', (req, res) => {
  if (csvLoadError) {
    return res.status(500).json({ error: csvLoadError });
  }
  return res.json(ingredients);
});

app.get('/api/ingredient-costs', (req, res) => {
  db.all('SELECT ingredient_name, cost_per_kg_inr, updated_at FROM ingredient_costs', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
});

app.post('/api/ingredient-costs', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const now = new Date().toISOString();
  db.serialize(() => {
    const stmt = db.prepare(
      'INSERT INTO ingredient_costs (ingredient_name, cost_per_kg_inr, updated_at) VALUES (?, ?, ?) '
        + 'ON CONFLICT(ingredient_name) DO UPDATE SET cost_per_kg_inr = excluded.cost_per_kg_inr, updated_at = excluded.updated_at'
    );
    payload.forEach((item) => {
      if (!item.ingredient_name) return;
      stmt.run(item.ingredient_name, toNumber(item.cost_per_kg_inr, 0), now);
    });
    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ success: true });
    });
  });
});

app.get('/api/scenarios', (req, res) => {
  db.all('SELECT id, name, recipe_code, inputs_json, results_json, created_at FROM scenarios ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows.map((row) => ({
      ...row,
      inputs: JSON.parse(row.inputs_json),
      results: JSON.parse(row.results_json)
    })));
  });
});

app.get('/api/scenarios/:id', (req, res) => {
  db.get('SELECT id, name, recipe_code, inputs_json, results_json, created_at FROM scenarios WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Scenario not found.' });
    }
    return res.json({
      ...row,
      inputs: JSON.parse(row.inputs_json),
      results: JSON.parse(row.results_json)
    });
  });
});

app.post('/api/scenarios', (req, res) => {
  const { name, recipe_code, inputs, results } = req.body;
  if (!name || !recipe_code) {
    return res.status(400).json({ error: 'Missing scenario name or recipe code.' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO scenarios (name, recipe_code, inputs_json, results_json, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, recipe_code, JSON.stringify(inputs || {}), JSON.stringify(results || {}), createdAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/scenarios/:id', (req, res) => {
  db.run('DELETE FROM scenarios WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ success: true });
  });
});

app.get('/api/scenarios-export.csv', (req, res) => {
  db.all('SELECT id, name, recipe_code, inputs_json, results_json, created_at FROM scenarios ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Failed to export');
    }
    const header = ['id', 'name', 'recipe_code', 'inputs_json', 'results_json', 'created_at'];
    const csvLines = [header.join(',')];
    rows.forEach((row) => {
      const line = [
        row.id,
        JSON.stringify(row.name),
        JSON.stringify(row.recipe_code),
        JSON.stringify(row.inputs_json),
        JSON.stringify(row.results_json),
        JSON.stringify(row.created_at)
      ].join(',');
      csvLines.push(line);
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('scenarios-export.csv');
    return res.send(csvLines.join('\n'));
  });
});

app.get('/api/dashboard', (req, res) => {
  const recipeTypes = {};
  const foodTypes = {};
  const ingredientUsage = {};
  recipes.forEach((recipe) => {
    recipeTypes[recipe.recipe_type] = (recipeTypes[recipe.recipe_type] || 0) + 1;
    foodTypes[recipe.food_type] = (foodTypes[recipe.food_type] || 0) + 1;
    recipe.primary_ingredients.forEach((item) => {
      ingredientUsage[item.ingredient] = (ingredientUsage[item.ingredient] || 0) + 1;
    });
  });
  const topIngredients = Object.entries(ingredientUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ingredient, count]) => ({ ingredient, count }));

  res.json({
    totalRecipes: recipes.length,
    uniqueIngredients: ingredients.length,
    recipeTypes,
    foodTypes,
    topIngredients
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Doggzi portal running on port ${PORT}`);
});
