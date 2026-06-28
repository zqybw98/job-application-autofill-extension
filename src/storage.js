(function () {
  "use strict";

  if (globalThis.JobApplicationStorage) {
    return;
  }

  const PROFILE_KEY = "profile";
  const SETTINGS_KEY = "settings";
  const APPLICATIONS_KEY = "applications";

  const DEFAULT_PROFILE = Object.freeze({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    linkedin: "",
    highestDegree: "",
    fieldOfStudy: "",
    germanLevel: "",
    englishLevel: "",
    availabilityDate: "",
    workAuthorization: "",
    requiresSponsorship: false
  });

  const DEFAULT_SETTINGS = Object.freeze({
    allowOverwrite: false
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function hasStorageApi() {
    return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
  }

  async function getLocal(keys) {
    if (!hasStorageApi()) {
      throw new Error("chrome.storage.local is not available.");
    }

    return chrome.storage.local.get(keys);
  }

  async function setLocal(values) {
    if (!hasStorageApi()) {
      throw new Error("chrome.storage.local is not available.");
    }

    return chrome.storage.local.set(values);
  }

  function mergeProfile(profile) {
    return {
      ...clone(DEFAULT_PROFILE),
      ...(profile || {})
    };
  }

  function mergeSettings(settings) {
    return {
      ...clone(DEFAULT_SETTINGS),
      ...(settings || {})
    };
  }

  async function getProfile() {
    const result = await getLocal(PROFILE_KEY);
    return mergeProfile(result[PROFILE_KEY]);
  }

  async function saveProfile(profile) {
    const normalizedProfile = mergeProfile(profile);
    await setLocal({ [PROFILE_KEY]: normalizedProfile });
    return normalizedProfile;
  }

  async function getSettings() {
    const result = await getLocal(SETTINGS_KEY);
    return mergeSettings(result[SETTINGS_KEY]);
  }

  async function saveSettings(settings) {
    const normalizedSettings = mergeSettings(settings);
    await setLocal({ [SETTINGS_KEY]: normalizedSettings });
    return normalizedSettings;
  }

  async function getApplications() {
    const result = await getLocal(APPLICATIONS_KEY);
    return Array.isArray(result[APPLICATIONS_KEY]) ? result[APPLICATIONS_KEY] : [];
  }

  async function saveApplications(applications) {
    const normalizedApplications = Array.isArray(applications) ? applications : [];
    await setLocal({ [APPLICATIONS_KEY]: normalizedApplications });
    return normalizedApplications;
  }

  globalThis.JobApplicationStorage = {
    DEFAULT_PROFILE,
    DEFAULT_SETTINGS,
    getProfile,
    saveProfile,
    getSettings,
    saveSettings,
    getApplications,
    saveApplications
  };
})();

