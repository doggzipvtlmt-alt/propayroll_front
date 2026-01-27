initPage({
  title: "User Directory (Maker)",
  content: `
    <div class="form-section">
      <h4>User Filters</h4>
      <div class="form-grid">
        <input placeholder="Search user" />
        <select>
          <option>All Roles</option>
          <option>HR</option>
          <option>FINANCE</option>
          <option>MD</option>
          <option>EMPLOYEE</option>
        </select>
      </div>
    </div>
    <div id="userTable"></div>
  `,
  onReady: async () => {
    const tableHost = document.getElementById("userTable");
    const loader = showLoader(tableHost);
    let data = [];
    try {
      const response = await request("/api/maker/users", "GET");
      data = response?.items || [];
    } catch (error) {
      data = SAMPLE_DATA.users;
      showToast("Using fallback user directory.");
    }
    hideLoader(loader);
    tableHost.innerHTML = renderTable({
      columns: [
        { key: "id", label: "User ID" },
        { key: "name", label: "Full Name" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" }
      ],
      rows: data.map((user) => ({
        ...user,
        status: createBadge(user.status || "Active", "success")
      }))
    });
  }
});
