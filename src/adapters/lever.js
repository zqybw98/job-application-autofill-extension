(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.lever = {
    id: "lever",
    name: "Lever",
    matches(url) {
      return String(url || "").toLowerCase().includes("lever.co");
    },
    getHints() {
      // TODO: Add Lever-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "Lever", strategy: "generic" };
    }
  };
})();

