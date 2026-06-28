(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.personio = {
    id: "personio",
    name: "Personio",
    matches(url) {
      return String(url || "").toLowerCase().includes("personio");
    },
    getHints() {
      // TODO: Add Personio-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "Personio", strategy: "generic" };
    }
  };
})();

