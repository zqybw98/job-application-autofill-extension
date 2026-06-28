(function () {
  "use strict";

  const form = document.getElementById("applicationForm");
  const table = document.getElementById("applicationsTable");
  const tableBody = table.querySelector("tbody");
  const emptyState = document.getElementById("emptyState");

  function setInput(name, value) {
    form.elements[name].value = value || "";
  }

  function getFormData() {
    return {
      company: form.elements.company.value.trim(),
      role: form.elements.role.value.trim(),
      url: form.elements.url.value.trim(),
      platform: form.elements.platform.value.trim(),
      status: form.elements.status.value
    };
  }

  function setText(selector, value) {
    document.querySelector(selector).textContent = value;
  }

  function formatDate(value) {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleString();
  }

  function createStatusSelect(application) {
    const select = document.createElement("select");

    for (const status of JobApplicationTracker.STATUSES) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === application.status;
      select.appendChild(option);
    }

    select.addEventListener("change", async () => {
      await JobApplicationTracker.updateApplicationStatus(application.id, select.value);
      await render();
    });

    return select;
  }

  function createUrlLink(application) {
    if (!application.url) {
      return document.createTextNode("");
    }

    const link = document.createElement("a");
    link.href = application.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open";
    return link;
  }

  function createDeleteButton(application) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Delete";
    button.addEventListener("click", async () => {
      if (!confirm("Delete this local application record?")) {
        return;
      }

      await JobApplicationTracker.deleteApplication(application.id);
      await render();
    });
    return button;
  }

  function appendTextCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value || "";
    row.appendChild(cell);
  }

  function appendNodeCell(row, node) {
    const cell = document.createElement("td");
    cell.appendChild(node);
    row.appendChild(cell);
  }

  async function render() {
    const applications = await JobApplicationTracker.listApplications();
    const stats = JobApplicationTracker.getStats(applications);

    setText('[data-stat="total"]', stats.total);
    setText('[data-stat="applied"]', stats.applied);
    setText('[data-stat="interviewing"]', stats.interviewing);
    setText('[data-stat="offered"]', stats.offered);
    setText('[data-stat="rejected"]', stats.rejected);
    setText('[data-stat="responseRate"]', `${stats.responseRate}%`);

    tableBody.replaceChildren();

    for (const application of applications) {
      const row = document.createElement("tr");
      appendTextCell(row, application.company);
      appendTextCell(row, application.role);
      appendTextCell(row, application.platform);
      appendNodeCell(row, createStatusSelect(application));
      appendTextCell(row, formatDate(application.updatedAt));
      appendNodeCell(row, createUrlLink(application));
      appendNodeCell(row, createDeleteButton(application));
      tableBody.appendChild(row);
    }

    const hasApplications = applications.length > 0;
    table.hidden = !hasApplications;
    emptyState.hidden = hasApplications;
  }

  function prefillFromQuery() {
    const params = new URLSearchParams(location.search);
    const suggestion = JobApplicationTracker.suggestFromPage(params.get("title"), params.get("url"));

    setInput("company", suggestion.company);
    setInput("role", suggestion.role);
    setInput("url", suggestion.url);
    setInput("platform", suggestion.platform);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await JobApplicationTracker.addApplication(getFormData());
    form.reset();
    await render();
  });

  document.getElementById("clearForm").addEventListener("click", () => {
    form.reset();
  });

  prefillFromQuery();
  render();
})();

