(function () {
  "use strict";

  const CONTENT_SCRIPT_FILES = ["src/fieldDetector.js", "src/autofillEngine.js"];
  const DETECTOR_SCRIPT_FILES = ["src/fieldDetector.js"];

  const statusElement = document.getElementById("status");

  const PROFILE_FIELD_LABELS = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    phoneCountryCode: "Phone country code",
    phoneLocalNumber: "Phone local number",
    streetAddress: "Street address",
    postalCode: "Postal code",
    city: "City",
    country: "Country",
    linkedin: "LinkedIn",
    title: "Title",
    nameSuffix: "Name suffix",
    highestDegree: "Highest degree",
    fieldOfStudy: "Field of study",
    university: "University",
    germanLevel: "German level",
    englishLevel: "English level",
    availabilityDate: "Availability date",
    noticePeriodOrStartDate: "Notice period or start date",
    workAuthorization: "Work authorization",
    requiresSponsorship: "Visa sponsorship",
    birthDate: "Birth date",
    gender: "Gender",
    nationality: "Nationality",
    locationPreference1: "Location preference 1",
    locationPreference2: "Location preference 2",
    travelReadiness: "Travel readiness",
    salaryExpectation: "Salary expectation",
    talentPoolConsent: "Talent pool consent",
    disabilityStatus: "Disability / equal status",
    resumeUpload: "Resume upload",
    certificateUpload: "Certificate upload"
  };

  function replaceStatus(...nodes) {
    statusElement.replaceChildren(...nodes);
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function setStatus(message) {
    replaceStatus(createElement("div", "status-message", message));
  }

  function formatProfileField(profileField) {
    return PROFILE_FIELD_LABELS[profileField] || profileField || "Unmapped field";
  }

  function formatElementType(mapping) {
    if (!mapping) {
      return "";
    }

    return `${mapping.tagName || "field"}${mapping.inputType ? `:${mapping.inputType}` : ""}`;
  }

  function formatConfidence(confidence) {
    return `${Math.round(Number(confidence || 0) * 100)}%`;
  }

  function normalizeStatus(mapping) {
    if (mapping.status) {
      return mapping.status;
    }

    if (mapping.action === "filled") {
      return "filled";
    }

    if (mapping.reason === "field already has a value") {
      return "skipped: already has value";
    }

    if (mapping.reason === "manual upload required") {
      return "manual upload required";
    }

    if (mapping.reason === "profile value is empty") {
      return "skipped: no profile value";
    }

    if (mapping.reason) {
      return `skipped: ${mapping.reason}`;
    }

    return "fillable";
  }

  function getStatusClass(status) {
    if (status === "filled") {
      return "field-status filled";
    }

    if (status === "fillable") {
      return "field-status fillable";
    }

    return "field-status skipped";
  }

  function createSummaryItem(label, value) {
    const item = createElement("div", "summary-item");
    item.append(
      createElement("span", "summary-label", label),
      createElement("span", "summary-value", String(value))
    );
    return item;
  }

  function createSummaryGrid(result) {
    const mappedFieldCount = result.mappedFieldCount ?? (Array.isArray(result.mappings) ? result.mappings.length : 0);
    const grid = createElement("div", "summary-grid");

    grid.append(
      createSummaryItem("Detected", result.detectedFieldCount || 0),
      createSummaryItem("Mapped", mappedFieldCount),
      createSummaryItem("Filled", result.filledFieldCount || 0),
      createSummaryItem("Skipped", result.skippedFieldCount || 0)
    );

    return grid;
  }

  function createFieldRow(mapping) {
    const status = normalizeStatus(mapping);
    const row = createElement("div", "field-row");
    const header = createElement("div", "field-header");

    header.append(
      createElement("div", "field-name", formatProfileField(mapping.profileField)),
      createElement("div", getStatusClass(status), status)
    );

    row.append(
      header,
      createElement("div", "field-detail field-label", mapping.label || "No visible label detected"),
      createElement("div", "field-detail", `Element: ${formatElementType(mapping)}`),
      createElement("div", "field-detail", `Confidence: ${formatConfidence(mapping.confidence)}`)
    );

    return row;
  }

  function renderResult(title, result) {
    const mappings = Array.isArray(result && result.mappings) ? result.mappings : [];
    const titleElement = createElement("h2", "result-title", title);
    const summaryGrid = createSummaryGrid(result || {});

    if (mappings.length === 0) {
      replaceStatus(titleElement, summaryGrid, createElement("div", "status-message", "No confident mappings detected."));
      return;
    }

    const fieldList = createElement("div", "field-list");
    fieldList.append(...mappings.map(createFieldRow));
    replaceStatus(titleElement, summaryGrid, fieldList);
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
      renderResult("Autofill result", {
        ...result,
        mappedFieldCount: Array.isArray(result.mappings) ? result.mappings.length : 0
      });
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

      const profile = await JobApplicationStorage.getProfile();

      await injectScripts(tab.id, DETECTOR_SCRIPT_FILES);
      const [executionResult] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (currentProfile) => {
          const detector = globalThis.JobApplicationFieldDetector;
          const detections = detector.detectFields(document);

          function getProfileValue(profileField) {
            const fallbackFields = {
              phone: ["phone", "phoneLocalNumber"],
              phoneLocalNumber: ["phoneLocalNumber", "phone"],
              availabilityDate: ["availabilityDate", "noticePeriodOrStartDate"],
              noticePeriodOrStartDate: ["noticePeriodOrStartDate", "availabilityDate"]
            };

            for (const fieldName of fallbackFields[profileField] || [profileField]) {
              const value = currentProfile[fieldName];

              if (typeof value === "boolean" || (value !== null && value !== undefined && String(value).trim() !== "")) {
                return value;
              }
            }

            return "";
          }

          function hasProfileValue(profileField) {
            const value = getProfileValue(profileField);
            return typeof value === "boolean" || (value !== null && value !== undefined && String(value).trim() !== "");
          }

          function fieldHasValue(element) {
            const tagName = element.tagName.toLowerCase();
            const inputType = detector.normalizeText(element.getAttribute("type") || element.type || "");

            if (inputType === "checkbox") {
              return element.checked;
            }

            if (inputType === "radio") {
              if (!element.name) {
                return element.checked;
              }

              return Array.from(document.querySelectorAll('input[type="radio"]'))
                .filter((radio) => radio.name === element.name)
                .some((radio) => radio.checked);
            }

            if (tagName === "select") {
              return element.value !== "";
            }

            return String(element.value || "").trim() !== "";
          }

          const mappings = detections
            .filter((detection) => detection.profileField)
            .map((detection) => {
              const hasProfile = hasProfileValue(detection.profileField);
              const hasCurrentValue = fieldHasValue(detection.element);
              const inputType = detector.normalizeText(detection.element.getAttribute("type") || detection.element.type || "");
              let status = "fillable";

              if (inputType === "file") {
                status = "manual upload required";
              } else if (!hasProfile) {
                status = "skipped: no profile value";
              } else if (hasCurrentValue) {
                status = "skipped: already has value";
              }

              return {
                ...detector.serializeDetection(detection),
                status
              };
            });

          return {
            detectedFieldCount: detections.length,
            mappedFieldCount: mappings.length,
            filledFieldCount: 0,
            skippedFieldCount: mappings.filter((mapping) => mapping.status !== "fillable").length,
            mappings
          };
        },
        args: [profile]
      });

      const result = executionResult.result;
      renderResult("Detected fields", result);
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
