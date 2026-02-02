const state = {
  recipes: [],
  ingredients: [],
  ingredientCosts: {},
  selectedRecipe: null,
  charts: {}
};

const els = {
  loginScreen: document.getElementById('login-screen'),
  app: document.getElementById('app'),
  loginBtn: document.getElementById('login-btn'),
  accessCode: document.getElementById('access-code'),
  loginError: document.getElementById('login-error'),
  logoutBtn: document.getElementById('logout-btn'),
  navButtons: document.querySelectorAll('.nav-btn'),
  sections: document.querySelectorAll('.section')
};

function showSection(id) {
  els.sections.forEach((section) => {
    section.classList.toggle('active', section.id === id);
  });
  els.navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.section === id);
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

async function checkSession() {
  try {
    const session = await api('/api/session');
    if (session.authenticated) {
      els.loginScreen.classList.add('hidden');
      els.app.classList.remove('hidden');
      await initApp();
    }
  } catch (err) {
    console.error(err);
  }
}

async function login() {
  try {
    await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ accessCode: els.accessCode.value.trim() })
    });
    els.loginScreen.classList.add('hidden');
    els.app.classList.remove('hidden');
    await initApp();
  } catch (err) {
    els.loginError.textContent = 'Invalid access code.';
  }
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
  window.location.reload();
}

async function loadDashboard() {
  const data = await api('/api/dashboard');
  document.getElementById('total-recipes').textContent = data.totalRecipes;
  document.getElementById('unique-ingredients').textContent = data.uniqueIngredients;
  const topList = document.getElementById('top-ingredients');
  topList.innerHTML = '';
  data.topIngredients.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.ingredient} (${item.count})`;
    topList.appendChild(li);
  });
  renderBarChart('recipe-type-chart', data.recipeTypes, 'Recipe Type');
  renderBarChart('food-type-chart', data.foodTypes, 'Food Type');
}

function renderBarChart(canvasId, dataset, label) {
  const ctx = document.getElementById(canvasId);
  if (state.charts[canvasId]) {
    state.charts[canvasId].destroy();
  }
  const labels = Object.keys(dataset).filter(Boolean);
  const values = labels.map((key) => dataset[key]);
  state.charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label, data: values, backgroundColor: '#4c6ef5' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}

function populateFilters(select, values) {
  select.innerHTML = '<option value="">All</option>';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

async function loadRecipes() {
  state.recipes = await api('/api/recipes');
  const species = Array.from(new Set(state.recipes.map((r) => r.species).filter(Boolean)));
  const foods = Array.from(new Set(state.recipes.map((r) => r.food_type).filter(Boolean)));
  const types = Array.from(new Set(state.recipes.map((r) => r.recipe_type).filter(Boolean)));
  populateFilters(document.getElementById('filter-species'), species);
  populateFilters(document.getElementById('filter-food'), foods);
  populateFilters(document.getElementById('filter-recipe'), types);
  populateFilters(document.getElementById('recipe-filter-species'), species);
  populateFilters(document.getElementById('recipe-filter-food'), foods);
  populateFilters(document.getElementById('recipe-filter-type'), types);
  populateFilters(document.getElementById('sim-recipe-select'), state.recipes.map((r) => `${r.name} (${r.recipe_code})`));
  document.getElementById('sim-recipe-select').innerHTML = state.recipes.map((r) => `<option value="${r.recipe_code}">${r.name} (${r.recipe_code})</option>`).join('');
  renderRecipeTable(state.recipes);
  selectRecipe(state.recipes[0]?.recipe_code);
}

function renderRecipeTable(list) {
  const tbody = document.querySelector('#recipe-table tbody');
  tbody.innerHTML = '';
  list.forEach((recipe) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${recipe.name}</td>
      <td>${recipe.recipe_code}</td>
      <td>${recipe.species}</td>
      <td>${recipe.food_type}</td>
      <td>${recipe.recipe_type}</td>
      <td>${recipe.quantity_grams}</td>
      <td><button class="view-btn" data-code="${recipe.recipe_code}">View</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderRecipeDetail(recipe) {
  if (!recipe) return;
  document.getElementById('recipe-meta').innerHTML = `
    <p><strong>Recipe Code:</strong> ${recipe.recipe_code}</p>
    <p><strong>Type:</strong> ${recipe.recipe_type}</p>
    <p><strong>Food Type:</strong> ${recipe.food_type}</p>
    <p><strong>Species:</strong> ${recipe.species}</p>
    <p><strong>Diet Type:</strong> ${recipe.diet_type}</p>
    <p><strong>Quantity:</strong> ${recipe.quantity_grams} g</p>
  `;
  const warning = document.getElementById('percentage-warning');
  warning.textContent = recipe.percentage_warning
    ? `Warning: ingredient percentages sum to ${recipe.total_percentage.toFixed(1)}%.`
    : '';
  const tbody = document.querySelector('#ingredient-table tbody');
  tbody.innerHTML = '';
  recipe.primary_ingredients.forEach((item) => {
    const grams = (recipe.quantity_grams * item.percentage) / 100;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.ingredient}</td>
      <td>${item.percentage}%</td>
      <td>${grams.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
  const optionsEl = document.getElementById('ingredient-options');
  if (recipe.ingredient_options.length) {
    optionsEl.innerHTML = '<h4>Ingredient Alternatives</h4>';
    const list = document.createElement('ul');
    recipe.ingredient_options.forEach((opt) => {
      const li = document.createElement('li');
      li.textContent = `${opt.ingredient} (${opt.percentage}%)`;
      list.appendChild(li);
    });
    optionsEl.appendChild(list);
  } else {
    optionsEl.innerHTML = '';
  }
}

function selectRecipe(code) {
  const recipe = state.recipes.find((r) => r.recipe_code === code);
  state.selectedRecipe = recipe;
  renderRecipeDetail(recipe);
  renderSimulatorRecipe(recipe);
}

function renderSimulatorRecipe(recipe) {
  if (!recipe) return;
  document.getElementById('sim-recipe-info').innerHTML = `
    <p><strong>Serving size:</strong> ${recipe.quantity_grams} g</p>
    <p><strong>Recipe Type:</strong> ${recipe.recipe_type}</p>
  `;
  const tbody = document.querySelector('#sim-ingredient-mix tbody');
  tbody.innerHTML = '';
  recipe.primary_ingredients.forEach((item) => {
    const grams = (recipe.quantity_grams * item.percentage) / 100;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.ingredient}</td><td>${item.percentage}%</td><td>${grams.toFixed(1)}</td>`;
    tbody.appendChild(row);
  });
  renderCostInputs(recipe);
  calculateOutputs();
}

async function loadIngredientCosts() {
  const rows = await api('/api/ingredient-costs');
  state.ingredientCosts = rows.reduce((acc, row) => {
    acc[row.ingredient_name] = row.cost_per_kg_inr;
    return acc;
  }, {});
}

function renderCostInputs(recipe) {
  const tbody = document.querySelector('#cost-table tbody');
  tbody.innerHTML = '';
  recipe.primary_ingredients.forEach((item) => {
    const row = document.createElement('tr');
    row.dataset.ingredient = item.ingredient;
    row.innerHTML = `
      <td>${item.ingredient}</td>
      <td><input type="number" min="0" step="0.1" value="${state.ingredientCosts[item.ingredient] || ''}" /></td>
    `;
    tbody.appendChild(row);
  });
}

function getCostInputs() {
  const rows = document.querySelectorAll('#cost-table tbody tr');
  const costs = {};
  rows.forEach((row) => {
    const ingredient = row.dataset.ingredient;
    const value = Number(row.querySelector('input').value) || 0;
    costs[ingredient] = value;
  });
  return costs;
}

function getNumber(id, fallback = 0) {
  const value = Number(document.getElementById(id).value);
  return Number.isNaN(value) ? fallback : value;
}

function calculateOutputs() {
  const recipe = state.selectedRecipe;
  if (!recipe) return;
  const costs = getCostInputs();
  const packaging = getNumber('packaging-per-unit');
  const delivery = getNumber('delivery-per-unit');
  const gatewayPercent = getNumber('gateway-percent');
  const commissionPercent = getNumber('commission-percent');
  const fixedCosts = getNumber('fixed-rent') + getNumber('fixed-salaries') + getNumber('fixed-utilities') + getNumber('fixed-tools') + getNumber('fixed-other');
  const variableCosts = getNumber('var-marketing') + getNumber('var-ops');
  const baselineUnits = Math.max(0, Math.round(getNumber('baseline-units')));
  const elasticity = getNumber('price-elasticity', -1.2) || -1.2;
  const sellingPrice = Math.max(0, getNumber('selling-price'));
  const referencePrice = Math.max(1, getNumber('reference-price') || sellingPrice || 1);
  const taxPercent = getNumber('tax-percent');
  const cac = getNumber('cac');
  const repeatRate = getNumber('repeat-rate') / 100;

  const ingredientCostTotal = recipe.primary_ingredients.reduce((sum, item) => {
    const grams = (recipe.quantity_grams * item.percentage) / 100;
    const costPerKg = costs[item.ingredient] || 0;
    return sum + (grams / 1000) * costPerKg;
  }, 0);

  const unitCogs = ingredientCostTotal + packaging + delivery;
  const gatewayFee = (sellingPrice * gatewayPercent) / 100;
  const commissionFee = (sellingPrice * commissionPercent) / 100;
  const taxImpact = (sellingPrice * taxPercent) / 100;
  const grossMargin = sellingPrice - unitCogs - gatewayFee - commissionFee - taxImpact;

  let projectedUnits = baselineUnits;
  if (sellingPrice > 0) {
    projectedUnits = Math.max(0, Math.round(baselineUnits * Math.pow(sellingPrice / referencePrice, elasticity)));
  }
  if (cac > 0) {
    const customersPossible = getNumber('var-marketing') / cac;
    projectedUnits = Math.max(projectedUnits, Math.round(customersPossible * (1 + repeatRate)));
  }

  const revenue = sellingPrice * projectedUnits;
  const grossProfit = grossMargin * projectedUnits;
  const netProfit = grossProfit - fixedCosts - variableCosts;
  const contributionMargin = sellingPrice - unitCogs - gatewayFee - commissionFee - taxImpact;
  const breakEven = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

  document.getElementById('unit-cogs').textContent = `₹${unitCogs.toFixed(2)}`;
  document.getElementById('gross-margin').textContent = `₹${grossMargin.toFixed(2)}`;
  document.getElementById('projected-units').textContent = projectedUnits;
  document.getElementById('net-profit').textContent = `₹${netProfit.toFixed(0)}`;
  document.getElementById('break-even').textContent = breakEven;

  renderSimulatorCharts({
    sellingPrice,
    baselineUnits,
    elasticity,
    referencePrice,
    unitCogs,
    gatewayPercent,
    commissionPercent,
    taxPercent,
    fixedCosts,
    variableCosts
  });
}

function renderSimulatorCharts(data) {
  const pricePoints = [];
  const profitPoints = [];
  const unitPoints = [];
  for (let price = Math.max(1, data.sellingPrice - 50); price <= data.sellingPrice + 50; price += 5) {
    const units = Math.max(0, Math.round(data.baselineUnits * Math.pow(price / data.referencePrice, data.elasticity)));
    const gatewayFee = (price * data.gatewayPercent) / 100;
    const commissionFee = (price * data.commissionPercent) / 100;
    const taxImpact = (price * data.taxPercent) / 100;
    const margin = price - data.unitCogs - gatewayFee - commissionFee - taxImpact;
    const net = margin * units - data.fixedCosts - data.variableCosts;
    pricePoints.push(price);
    profitPoints.push(net);
    unitPoints.push(units);
  }

  state.charts['profit-chart']?.destroy();
  state.charts['profit-chart'] = new Chart(document.getElementById('profit-chart'), {
    type: 'line',
    data: { labels: pricePoints, datasets: [{ label: 'Net Profit', data: profitPoints, borderColor: '#2f6fed' }] },
    options: { responsive: true }
  });

  state.charts['units-chart']?.destroy();
  state.charts['units-chart'] = new Chart(document.getElementById('units-chart'), {
    type: 'line',
    data: { labels: pricePoints, datasets: [{ label: 'Units', data: unitPoints, borderColor: '#20c997' }] },
    options: { responsive: true }
  });

  const costBreakdown = {
    Ingredients: data.unitCogs,
    Fees: (data.sellingPrice * (data.gatewayPercent + data.commissionPercent)) / 100,
    Tax: (data.sellingPrice * data.taxPercent) / 100
  };
  state.charts['cost-chart']?.destroy();
  state.charts['cost-chart'] = new Chart(document.getElementById('cost-chart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(costBreakdown),
      datasets: [{ data: Object.values(costBreakdown), backgroundColor: ['#4c6ef5', '#ffa94d', '#f06595'] }]
    },
    options: { responsive: true }
  });
}

async function saveCostLibrary() {
  const payload = Object.entries(getCostInputs()).map(([ingredient_name, cost_per_kg_inr]) => ({
    ingredient_name,
    cost_per_kg_inr
  }));
  await api('/api/ingredient-costs', { method: 'POST', body: JSON.stringify(payload) });
  document.getElementById('cost-save-status').textContent = 'Saved ingredient cost library.';
  setTimeout(() => (document.getElementById('cost-save-status').textContent = ''), 2000);
}

function applyPreset(type) {
  const presets = {
    conservative: { baseline: 500, elasticity: -1.5, marketing: 20000, cac: 200, repeat: 15 },
    base: { baseline: 1200, elasticity: -1.2, marketing: 40000, cac: 150, repeat: 25 },
    aggressive: { baseline: 2500, elasticity: -0.9, marketing: 80000, cac: 120, repeat: 40 }
  };
  const preset = presets[type];
  document.getElementById('baseline-units').value = preset.baseline;
  document.getElementById('price-elasticity').value = preset.elasticity;
  document.getElementById('var-marketing').value = preset.marketing;
  document.getElementById('cac').value = preset.cac;
  document.getElementById('repeat-rate').value = preset.repeat;
  calculateOutputs();
}

async function saveScenario() {
  const name = document.getElementById('scenario-name').value.trim();
  if (!name) {
    document.getElementById('scenario-status').textContent = 'Scenario name is required.';
    return;
  }
  const inputs = {
    recipe: state.selectedRecipe?.recipe_code,
    costs: getCostInputs(),
    packaging: getNumber('packaging-per-unit'),
    delivery: getNumber('delivery-per-unit'),
    gatewayPercent: getNumber('gateway-percent'),
    commissionPercent: getNumber('commission-percent'),
    fixedCosts: {
      rent: getNumber('fixed-rent'),
      salaries: getNumber('fixed-salaries'),
      utilities: getNumber('fixed-utilities'),
      tools: getNumber('fixed-tools'),
      other: getNumber('fixed-other')
    },
    variableCosts: {
      marketing: getNumber('var-marketing'),
      operations: getNumber('var-ops')
    },
    demand: {
      baselineUnits: getNumber('baseline-units'),
      elasticity: getNumber('price-elasticity'),
      referencePrice: getNumber('reference-price'),
      cac: getNumber('cac'),
      repeatRate: getNumber('repeat-rate')
    },
    pricing: {
      sellingPrice: getNumber('selling-price'),
      taxPercent: getNumber('tax-percent')
    }
  };
  const results = {
    unitCogs: document.getElementById('unit-cogs').textContent,
    grossMargin: document.getElementById('gross-margin').textContent,
    projectedUnits: document.getElementById('projected-units').textContent,
    netProfit: document.getElementById('net-profit').textContent,
    breakEven: document.getElementById('break-even').textContent
  };
  await api('/api/scenarios', {
    method: 'POST',
    body: JSON.stringify({ name, recipe_code: state.selectedRecipe.recipe_code, inputs, results })
  });
  document.getElementById('scenario-status').textContent = 'Scenario saved.';
  setTimeout(() => (document.getElementById('scenario-status').textContent = ''), 2000);
}

async function loadScenarios() {
  const scenarios = await api('/api/scenarios');
  const container = document.getElementById('scenario-list');
  container.innerHTML = '';
  if (!scenarios.length) {
    container.textContent = 'No scenarios saved yet.';
    return;
  }
  scenarios.forEach((scenario) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${scenario.name}</h3>
      <p><strong>Recipe:</strong> ${scenario.recipe_code}</p>
      <p><strong>Created:</strong> ${new Date(scenario.created_at).toLocaleString()}</p>
      <pre>${JSON.stringify(scenario.results, null, 2)}</pre>
      <div class="button-row">
        <button class="delete-scenario" data-id="${scenario.id}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function initApp() {
  await loadIngredientCosts();
  await loadRecipes();
  await loadDashboard();
  bindEvents();
}

function bindEvents() {
  els.navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showSection(btn.dataset.section);
      if (btn.dataset.section === 'scenarios') {
        loadScenarios();
      }
    });
  });
  document.getElementById('apply-filters').addEventListener('click', async () => {
    const species = document.getElementById('filter-species').value;
    const food = document.getElementById('filter-food').value;
    const recipe = document.getElementById('filter-recipe').value;
    const query = new URLSearchParams({ species, food_type: food, recipe_type: recipe }).toString();
    const data = await api(`/api/recipes?${query}`);
    renderRecipeTable(data);
  });
  document.getElementById('recipe-filter-btn').addEventListener('click', async () => {
    const species = document.getElementById('recipe-filter-species').value;
    const food = document.getElementById('recipe-filter-food').value;
    const type = document.getElementById('recipe-filter-type').value;
    const search = document.getElementById('recipe-search').value;
    const query = new URLSearchParams({ species, food_type: food, recipe_type: type, search }).toString();
    const data = await api(`/api/recipes?${query}`);
    renderRecipeTable(data);
  });
  document.querySelector('#recipe-table tbody').addEventListener('click', (event) => {
    if (event.target.classList.contains('view-btn')) {
      selectRecipe(event.target.dataset.code);
    }
  });
  document.getElementById('sim-recipe-select').addEventListener('change', (event) => {
    selectRecipe(event.target.value);
  });
  document.getElementById('save-costs').addEventListener('click', saveCostLibrary);
  document.querySelectorAll('#simulator input').forEach((input) => {
    input.addEventListener('input', calculateOutputs);
  });
  document.querySelectorAll('.preset').forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  document.getElementById('save-scenario').addEventListener('click', saveScenario);
  document.getElementById('refresh-scenarios').addEventListener('click', loadScenarios);
  document.getElementById('export-scenarios').addEventListener('click', () => {
    window.open('/api/scenarios-export.csv', '_blank');
  });
  document.getElementById('scenario-list').addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-scenario')) {
      await api(`/api/scenarios/${event.target.dataset.id}`, { method: 'DELETE' });
      loadScenarios();
    }
  });
}

els.loginBtn.addEventListener('click', login);
els.logoutBtn.addEventListener('click', logout);

checkSession();
