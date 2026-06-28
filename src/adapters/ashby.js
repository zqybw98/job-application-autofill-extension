(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.ashby = {
    id: "ashby",
    name: "Ashby",
    matches(url) {
      return String(url || "").toLowerCase().includes("ashby");
    },
    getHints() {
      // TODO: Add Ashby-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "Ashby", strategy: "generic" };
    }
  };
})();

