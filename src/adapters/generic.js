(function () {
  "use strict";

  globalThis.JobApplicationAdapters = globalThis.JobApplicationAdapters || {};

  globalThis.JobApplicationAdapters.generic = {
    id: "generic",
    name: "Generic",
    matches() {
      return true;
    },
    getHints() {
      return {
        platform: "Generic",
        strategy: "Use label, placeholder, name, id, aria-label, and nearby text signals."
      };
    }
  };
})();

