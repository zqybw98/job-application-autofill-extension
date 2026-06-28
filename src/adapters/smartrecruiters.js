(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.smartrecruiters = {
    id: "smartrecruiters",
    name: "SmartRecruiters",
    matches(url) {
      return String(url || "").toLowerCase().includes("smartrecruiters");
    },
    getHints() {
      // TODO: Add SmartRecruiters-specific hints after manual testing. Avoid fragile selectors.
      return { platform: "SmartRecruiters", strategy: "generic" };
    }
  };
})();

