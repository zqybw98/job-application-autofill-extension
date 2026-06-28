(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.workday = {
    id: "workday",
    name: "Workday",
    matches(url) {
      return String(url || "").toLowerCase().includes("workday");
    },
    getHints() {
      // TODO: Add Workday-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "Workday", strategy: "generic" };
    }
  };
})();

