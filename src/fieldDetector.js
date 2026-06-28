(function () {
  "use strict";

  if (globalThis.JobApplicationFieldDetector) {
    return;
  }

  const CONTROL_SELECTOR = "input, textarea, select";
  const IGNORED_INPUT_TYPES = new Set(["button", "hidden", "image", "reset", "submit"]);

  const FIELD_MATCHERS = [
    {
      profileField: "firstName",
      patterns: [/\bfirst\s*name\b/, /\bfirstname\b/, /\bgiven\s*name\b/, /\bvorname\b/]
    },
    {
      profileField: "lastName",
      patterns: [/\blast\s*name\b/, /\blastname\b/, /\bfamily\s*name\b/, /\bsurname\b/, /\bnachname\b/]
    },
    {
      profileField: "email",
      patterns: [/\be-?mail\b/, /\bemail\s*address\b/]
    },
    {
      profileField: "phone",
      patterns: [/\bphone\b/, /\bmobile\b/, /\btelephone\b/, /\btelefon\b/, /\btelefonnummer\b/, /\bhandy\b/]
    },
    {
      profileField: "city",
      patterns: [/\bcity\b/, /\btown\b/, /\bstadt\b/, /\bwohnort\b/]
    },
    {
      profileField: "country",
      patterns: [/\bcountry\b/, /\bland\b/]
    },
    {
      profileField: "linkedin",
      patterns: [/\blinkedin\b/, /\blinkedin\s*profile\b/]
    },
    {
      profileField: "highestDegree",
      patterns: [/\bdegree\b/, /\bhighest\s*degree\b/, /\beducation\s*level\b/, /\babschluss\b/]
    },
    {
      profileField: "fieldOfStudy",
      patterns: [/\bfield\s*of\s*study\b/, /\bstudy\s*field\b/, /\bmajor\b/, /\bstudienfach\b/, /\bfachrichtung\b/]
    },
    {
      profileField: "germanLevel",
      patterns: [/\bgerman\b/, /\bgerman\s*level\b/, /\bdeutsch\b/, /\bdeutschkenntnisse\b/]
    },
    {
      profileField: "englishLevel",
      patterns: [/\benglish\b/, /\benglish\s*level\b/, /\benglisch\b/, /\benglischkenntnisse\b/]
    },
    {
      profileField: "availabilityDate",
      patterns: [/\bavailable\s*from\b/, /\bavailability\b/, /\bstart\s*date\b/, /\bverfugbar\s*ab\b/, /\beintrittsdatum\b/]
    },
    {
      profileField: "workAuthorization",
      patterns: [/\bwork\s*authorization\b/, /\bright\s*to\s*work\b/, /\bwork\s*permit\b/, /\barbeitserlaubnis\b/, /\barbeitsberechtigung\b/]
    },
    {
      profileField: "requiresSponsorship",
      patterns: [/\bsponsorship\b/, /\bvisa\s*sponsorship\b/, /\bvisa\s*support\b/, /\bsponsor\b/, /\bvisum\s*sponsoring\b/]
    }
  ];

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^\w\s@.+/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactText(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 220);
  }

  function safeCssEscape(value) {
    if (globalThis.CSS && CSS.escape) {
      return CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
  }

  function getLabelTexts(element) {
    const labels = [];

    if (element.labels) {
      labels.push(...Array.from(element.labels).map((label) => label.textContent));
    }

    if (element.id && element.ownerDocument) {
      const escapedId = safeCssEscape(element.id);
      const explicitLabel = element.ownerDocument.querySelector(`label[for="${escapedId}"]`);

      if (explicitLabel) {
        labels.push(explicitLabel.textContent);
      }
    }

    const parentLabel = element.closest ? element.closest("label") : null;

    if (parentLabel) {
      labels.push(parentLabel.textContent);
    }

    return labels.filter(Boolean).map((label) => compactText(label, 160));
  }

  function getNearbyText(element) {
    const parts = [];
    const parent = element.parentElement;

    if (parent) {
      const textNodes = Array.from(parent.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent);
      parts.push(...textNodes);
    }

    if (element.previousElementSibling) {
      parts.push(element.previousElementSibling.textContent);
    }

    const container = element.closest ? element.closest("fieldset, li, p, div, section") : null;

    if (container) {
      const legend = container.querySelector("legend");
      const label = container.querySelector("label");

      if (legend) {
        parts.push(legend.textContent);
      }

      if (label && label !== element.closest("label")) {
        parts.push(label.textContent);
      }
    }

    return parts.filter(Boolean).map((text) => compactText(text, 180)).join(" ");
  }

  function getSignalGroups(element) {
    const directSignals = [
      ...getLabelTexts(element),
      element.getAttribute("aria-label"),
      element.getAttribute("placeholder"),
      element.getAttribute("name"),
      element.getAttribute("id"),
      element.getAttribute("autocomplete"),
      element.getAttribute("title")
    ];

    if (element.type === "radio" || element.type === "checkbox") {
      directSignals.push(element.getAttribute("value"));
    }

    return {
      directText: compactText(directSignals.filter(Boolean).join(" "), 360),
      nearbyText: getNearbyText(element)
    };
  }

  function findBestMatch(normalizedText) {
    let bestMatch = null;

    if (!normalizedText) {
      return null;
    }

    for (const matcher of FIELD_MATCHERS) {
      for (const pattern of matcher.patterns) {
        if (pattern.test(normalizedText)) {
          const score = 0.72 + Math.min(pattern.source.length / 120, 0.2);

          if (!bestMatch || score > bestMatch.confidence) {
            bestMatch = {
              profileField: matcher.profileField,
              confidence: Number(score.toFixed(2))
            };
          }
        }
      }
    }

    return bestMatch;
  }

  function isSupportedControl(element) {
    if (!element || !element.tagName) {
      return false;
    }

    if (element.tagName.toLowerCase() !== "input") {
      return true;
    }

    const inputType = normalizeText(element.getAttribute("type") || "text");
    return !IGNORED_INPUT_TYPES.has(inputType);
  }

  function detectElement(element, index) {
    const signalGroups = getSignalGroups(element);
    const directText = normalizeText(signalGroups.directText);
    const combinedText = normalizeText(`${signalGroups.directText} ${signalGroups.nearbyText}`);
    let match = findBestMatch(directText);
    let source = "direct";

    if (!match) {
      match = findBestMatch(combinedText);
      source = "nearby";
    }

    return {
      index,
      element,
      tagName: element.tagName.toLowerCase(),
      inputType: element.getAttribute("type") || element.type || "",
      profileField: match ? match.profileField : null,
      confidence: match ? match.confidence : 0,
      source,
      label: compactText(signalGroups.directText || signalGroups.nearbyText, 180),
      signalText: combinedText
    };
  }

  function detectFields(root) {
    const searchRoot = root || document;
    return Array.from(searchRoot.querySelectorAll(CONTROL_SELECTOR))
      .filter(isSupportedControl)
      .map((element, index) => detectElement(element, index));
  }

  function serializeDetection(detection) {
    return {
      index: detection.index,
      tagName: detection.tagName,
      inputType: detection.inputType,
      profileField: detection.profileField,
      confidence: detection.confidence,
      source: detection.source,
      label: detection.label
    };
  }

  function inspect(root) {
    const detections = detectFields(root || document);
    const mappings = detections.filter((detection) => detection.profileField).map(serializeDetection);

    return {
      detectedFieldCount: detections.length,
      mappedFieldCount: mappings.length,
      mappings
    };
  }

  globalThis.JobApplicationFieldDetector = {
    detectFields,
    inspect,
    normalizeText,
    serializeDetection
  };
})();

