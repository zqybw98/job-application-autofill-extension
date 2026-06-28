(function () {
  "use strict";

  const CONTENT_SCRIPT_FILES = ["src/fieldDetector.js", "src/autofillEngine.js"];
  const DETECTOR_SCRIPT_FILES = ["src/fieldDetector.js"];

  const statusElement = document.getElementById("status");

  function setStatus(message) {
    statusElement.textContent = message;
  }

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  async function injectScripts(tabId, files) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files
    });
  }

  function summarizeMappings(result) {
    if (!result || !Array.isArray(result.mappings) || result.mappings.length === 0) {
      return "No confident mappings detected.";
    }

    return result.mappings
      .map((mapping) => {
        const action = mapping.action ? ` | ${mapping.action}` : "";
        const reason = mapping.reason ? ` | ${mapping.reason}` : "";
        return `- ${mapping.profileField} (${mapping.tagName}${mapping.inputType ? `:${mapping.inputType}` : ""}, ${mapping.confidence})${action}${reason}`;
      })
      .join("\n");
  }

  async function fillCurrentPage() {
    try {
      setStatus("Filling current page...");
      const tab = await getActiveTab();

      if (!tab || !tab.id) {
        setStatus("No active tab found.");
        return;
      }

      const [profile, settings] = await Promise.all([
        JobApplicationStorage.getProfile(),
        JobApplicationStorage.getSettings()
      ]);

      await injectScripts(tab.id, CONTENT_SCRIPT_FILES);
      const [executionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (currentProfile, currentSettings) => {
          return globalThis.JobApplicationAutofillEngine.run({
            profile: currentProfile,
            settings: currentSettings
          });
        },
        args: [profile, settings]
      });

      const result = executionResult.result;
      setStatus(
        [
          `Detected fields: ${result.detectedFieldCount}`,
          `Filled fields: ${result.filledFieldCount}`,
          `Skipped fields: ${result.skippedFieldCount}`,
          "",
          summarizeMappings(result)
        ].join("\n")
      );
    } catch (error) {
      setStatus(`Autofill failed: ${error.message}`);
    }
  }

  async function showDetectedFields() {
    try {
      setStatus("Detecting fields...");
      const tab = await getActiveTab();

      if (!tab || !tab.id) {
        setStatus("No active tab found.");
        return;
      }

      await injectScripts(tab.id, DETECTOR_SCRIPT_FILES);
      const [executionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => globalThis.JobApplicationFieldDetector.inspect()
      });

      const result = executionResult.result;
      setStatus(
        [
          `Detected fields: ${result.detectedFieldCount}`,
          `Mapped fields: ${result.mappedFieldCount}`,
          "",
          summarizeMappings(result)
        ].join("\n")
      );
    } catch (error) {
      setStatus(`Field detection failed: ${error.message}`);
    }
  }

  function openProfile() {
    chrome.runtime.openOptionsPage();
  }

  async function openDashboard() {
    const tab = await getActiveTab();
    const params = new URLSearchParams();

    if (tab && tab.url && !tab.url.startsWith("chrome://")) {
      params.set("url", tab.url);
    }

    if (tab && tab.title) {
      params.set("title", tab.title);
    }

    const dashboardUrl = chrome.runtime.getURL(`src/dashboard.html?${params.toString()}`);
    await chrome.tabs.create({ url: dashboardUrl });
  }

  document.getElementById("fillPage").addEventListener("click", fillCurrentPage);
  document.getElementById("showDetected").addEventListener("click", showDetectedFields);
  document.getElementById("openProfile").addEventListener("click", openProfile);
  document.getElementById("openDashboard").addEventListener("click", openDashboard);
})();

