(function () {
  "use strict";

  if (globalThis.JobApplicationAutofillEngine) {
    return;
  }

  const TEXT_INPUT_TYPES = new Set([
    "",
    "date",
    "email",
    "number",
    "search",
    "tel",
    "text",
    "url"
  ]);

  function normalizeText(value) {
    if (globalThis.JobApplicationFieldDetector) {
      return globalThis.JobApplicationFieldDetector.normalizeText(value);
    }

    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function hasProfileValue(value) {
    if (typeof value === "boolean") {
      return true;
    }

    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function dispatchFormEvents(element) {
    for (const eventName of ["input", "change", "blur"]) {
      element.dispatchEvent(new Event(eventName, { bubbles: true }));
    }
  }

  function getRadioGroup(element) {
    if (!element.name) {
      return [element];
    }

    const escapedName = element.name.replace(/["\\]/g, "\\$&");
    return Array.from(document.querySelectorAll(`input[type="radio"][name="${escapedName}"]`));
  }

  function getControlText(element) {
    const detector = globalThis.JobApplicationFieldDetector;

    if (detector) {
      const detection = detector.detectFields(document).find((item) => item.element === element);
      if (detection) {
        return normalizeText(`${detection.label} ${element.value || ""}`);
      }
    }

    return normalizeText(`${element.value || ""} ${element.getAttribute("aria-label") || ""}`);
  }

  function radioMatchesValue(element, value) {
    const optionText = getControlText(element);

    if (typeof value === "boolean") {
      const positiveTokens = ["yes", "true", "ja", "1"];
      const negativeTokens = ["no", "false", "nein", "0"];
      const tokens = value ? positiveTokens : negativeTokens;
      return tokens.some((token) => optionText.split(" ").includes(token));
    }

    const normalizedValue = normalizeText(value);
    return optionText.includes(normalizedValue) || normalizedValue.includes(optionText);
  }

  function isNonEmpty(element) {
    const tagName = element.tagName.toLowerCase();
    const inputType = normalizeText(element.getAttribute("type") || element.type || "");

    if (inputType === "checkbox") {
      return element.checked;
    }

    if (inputType === "radio") {
      return getRadioGroup(element).some((radio) => radio.checked);
    }

    if (tagName === "select") {
      return element.value !== "";
    }

    return String(element.value || "").trim() !== "";
  }

  function fillTextControl(element, value) {
    element.focus();
    element.value = String(value);
    dispatchFormEvents(element);
    return { filled: true };
  }

  function findSelectOption(element, value) {
    const options = Array.from(element.options || []);

    if (typeof value === "boolean") {
      const tokens = value ? ["yes", "true", "ja", "1"] : ["no", "false", "nein", "0"];
      return options.find((option) => {
        const optionText = normalizeText(`${option.value} ${option.textContent}`);
        return tokens.some((token) => optionText.split(" ").includes(token));
      });
    }

    const normalizedValue = normalizeText(value);
    const exactMatch = options.find((option) => {
      const optionValue = normalizeText(option.value);
      const optionText = normalizeText(option.textContent);
      return optionValue === normalizedValue || optionText === normalizedValue;
    });

    if (exactMatch) {
      return exactMatch;
    }

    return options.find((option) => {
      const optionValue = normalizeText(option.value);
      const optionText = normalizeText(option.textContent);
      return optionValue.includes(normalizedValue) || optionText.includes(normalizedValue);
    });
  }

  function fillSelectControl(element, value) {
    const option = findSelectOption(element, value);

    if (!option) {
      return { filled: false, reason: "no matching select option" };
    }

    element.value = option.value;
    dispatchFormEvents(element);
    return { filled: true };
  }

  function fillRadioControl(element, value) {
    const group = getRadioGroup(element);
    const target = group.find((radio) => radioMatchesValue(radio, value));

    if (!target) {
      return { filled: false, reason: "no matching radio option" };
    }

    target.checked = true;
    dispatchFormEvents(target);
    return { filled: true };
  }

  function fillCheckboxControl(element, value) {
    const nextChecked = typeof value === "boolean" ? value : ["yes", "true", "ja", "1"].includes(normalizeText(value));

    if (element.checked === nextChecked) {
      return { filled: false, reason: "checkbox already matches profile value" };
    }

    element.checked = nextChecked;
    dispatchFormEvents(element);
    return { filled: true };
  }

  function fillControl(detection, profile, settings) {
    const element = detection.element;
    const value = profile[detection.profileField];
    const tagName = element.tagName.toLowerCase();
    const inputType = normalizeText(element.getAttribute("type") || element.type || "");

    if (!hasProfileValue(value)) {
      return { filled: false, reason: "profile value is empty" };
    }

    if (inputType === "file") {
      return { filled: false, reason: "file inputs are never filled" };
    }

    if (!settings.allowOverwrite && isNonEmpty(element)) {
      return { filled: false, reason: "field already has a value" };
    }

    if (tagName === "select") {
      return fillSelectControl(element, value);
    }

    if (inputType === "radio") {
      return fillRadioControl(element, value);
    }

    if (inputType === "checkbox") {
      return fillCheckboxControl(element, value);
    }

    if (tagName === "textarea" || TEXT_INPUT_TYPES.has(inputType)) {
      return fillTextControl(element, value);
    }

    return { filled: false, reason: `unsupported input type: ${inputType || tagName}` };
  }

  function run(options) {
    const detector = globalThis.JobApplicationFieldDetector;

    if (!detector) {
      throw new Error("Field detector is not available.");
    }

    const profile = (options && options.profile) || {};
    const settings = {
      allowOverwrite: Boolean(options && options.settings && options.settings.allowOverwrite)
    };
    const detections = detector.detectFields(document);
    const mappedDetections = detections.filter((detection) => detection.profileField && detection.confidence >= 0.72);
    const mappings = [];
    let filledFieldCount = 0;
    let skippedFieldCount = 0;

    for (const detection of mappedDetections) {
      const result = fillControl(detection, profile, settings);

      if (result.filled) {
        filledFieldCount += 1;
      } else {
        skippedFieldCount += 1;
      }

      mappings.push({
        ...detector.serializeDetection(detection),
        action: result.filled ? "filled" : "skipped",
        reason: result.reason || ""
      });
    }

    return {
      detectedFieldCount: detections.length,
      filledFieldCount,
      skippedFieldCount,
      mappings
    };
  }

  globalThis.JobApplicationAutofillEngine = {
    run
  };
})();

