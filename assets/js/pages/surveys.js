initPage({
  title: "Surveys",
  content: `
    <div class="card">
      <h4>Active Surveys</h4>
      ${renderTable({
        columns: [
          { key: "title", label: "Survey" },
          { key: "deadline", label: "Deadline" },
          { key: "status", label: "Status" }
        ],
        rows: [
          { title: "Employee Engagement Pulse", deadline: "30 Apr", status: createBadge("Open", "warning") },
          { title: "Benefits Feedback", deadline: "15 May", status: createBadge("Not Started", "warning") }
        ]
      })}
    </div>
  `
});
