(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.greenhouse = {
    id: "greenhouse",
    name: "Greenhouse",
    matches(url) {
      return String(url || "").toLowerCase().includes("greenhouse");
    },
    getHints() {
      // TODO: Add Greenhouse-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "Greenhouse", strategy: "generic" };
    }
  };
})();

