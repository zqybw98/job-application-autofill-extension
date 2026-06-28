(function () {
  "use strict";

  if (globalThis.JobApplicationTracker) {
    return;
  }

  const STATUSES = ["draft", "applied", "interviewing", "offered", "rejected"];

  function makeId() {
    if (globalThis.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `app-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function sanitizeText(value, fallback) {
    const normalized = String(value || "").trim();
    return normalized || fallback || "";
  }

  function normalizeStatus(status) {
    return STATUSES.includes(status) ? status : "draft";
  }

  function inferPlatform(url) {
    const normalizedUrl = String(url || "").toLowerCase();

    if (normalizedUrl.includes("workday")) {
      return "Workday";
    }

    if (normalizedUrl.includes("greenhouse")) {
      return "Greenhouse";
    }

    if (normalizedUrl.includes("lever.co")) {
      return "Lever";
    }

    if (normalizedUrl.includes("personio")) {
      return "Personio";
    }

    if (normalizedUrl.includes("smartrecruiters")) {
      return "SmartRecruiters";
    }

    if (normalizedUrl.includes("ashby")) {
      return "Ashby";
    }

    return "Generic";
  }

  function suggestFromPage(title, url) {
    const cleanTitle = sanitizeText(title, "");
    const titleParts = cleanTitle
      .split(/\s[-|]\s/)
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      company: titleParts.length > 1 ? titleParts[titleParts.length - 1] : "",
      role: titleParts.length > 1 ? titleParts[0] : cleanTitle,
      url: sanitizeText(url, ""),
      platform: inferPlatform(url)
    };
  }

  async function listApplications() {
    const applications = await JobApplicationStorage.getApplications();
    return applications.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function addApplication(input) {
    const applications = await JobApplicationStorage.getApplications();
    const now = new Date().toISOString();
    const application = {
      id: makeId(),
      company: sanitizeText(input.company, "Unknown company"),
      role: sanitizeText(input.role, "Unknown role"),
      url: sanitizeText(input.url, ""),
      platform: sanitizeText(input.platform, inferPlatform(input.url)),
      status: normalizeStatus(input.status),
      createdAt: now,
      updatedAt: now
    };

    applications.unshift(application);
    await JobApplicationStorage.saveApplications(applications);
    return application;
  }

  async function updateApplicationStatus(id, status) {
    const applications = await JobApplicationStorage.getApplications();
    const now = new Date().toISOString();
    const updatedApplications = applications.map((application) => {
      if (application.id !== id) {
        return application;
      }

      return {
        ...application,
        status: normalizeStatus(status),
        updatedAt: now
      };
    });

    await JobApplicationStorage.saveApplications(updatedApplications);
  }

  async function deleteApplication(id) {
    const applications = await JobApplicationStorage.getApplications();
    await JobApplicationStorage.saveApplications(applications.filter((application) => application.id !== id));
  }

  function getStats(applications) {
    const stats = {
      total: applications.length,
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
      responseRate: 0
    };

    for (const application of applications) {
      if (Object.prototype.hasOwnProperty.call(stats, application.status)) {
        stats[application.status] += 1;
      }
    }

    const responded = stats.interviewing + stats.offered + stats.rejected;
    stats.responseRate = stats.total === 0 ? 0 : Math.round((responded / stats.total) * 100);

    return stats;
  }

  globalThis.JobApplicationTracker = {
    STATUSES,
    inferPlatform,
    suggestFromPage,
    listApplications,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    getStats
  };
})();

