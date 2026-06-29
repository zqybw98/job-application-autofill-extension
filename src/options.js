(function () {
  "use strict";

  const PROFILE_FIELDS = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "phoneCountryCode",
    "phoneLocalNumber",
    "streetAddress",
    "postalCode",
    "city",
    "country",
    "linkedin",
    "title",
    "nameSuffix",
    "highestDegree",
    "fieldOfStudy",
    "university",
    "germanLevel",
    "englishLevel",
    "availabilityDate",
    "noticePeriodOrStartDate",
    "workAuthorization",
    "locationPreference1",
    "locationPreference2",
    "travelReadiness",
    "salaryExpectation",
    "requiresSponsorship",
    "birthDate",
    "gender",
    "nationality",
    "talentPoolConsent",
    "disabilityStatus"
  ];

  const form = document.getElementById("profileForm");
  const statusElement = document.getElementById("status");

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function setFormValue(name, value) {
    const field = form.elements[name];

    if (!field) {
      return;
    }

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }

    field.value = value || "";
  }

  function getFormValue(name) {
    const field = form.elements[name];

    if (!field) {
      return "";
    }

    if (field.type === "checkbox") {
      return field.checked;
    }

    return field.value.trim();
  }

  async function loadProfile() {
    const [profile, settings] = await Promise.all([
      JobApplicationStorage.getProfile(),
      JobApplicationStorage.getSettings()
    ]);

    for (const fieldName of PROFILE_FIELDS) {
      setFormValue(fieldName, profile[fieldName]);
    }

    setFormValue("allowOverwrite", settings.allowOverwrite);
  }

  async function saveProfile(event) {
    event.preventDefault();

    const profile = {};
    for (const fieldName of PROFILE_FIELDS) {
      profile[fieldName] = getFormValue(fieldName);
    }

    const settings = {
      allowOverwrite: getFormValue("allowOverwrite")
    };

    await Promise.all([
      JobApplicationStorage.saveProfile(profile),
      JobApplicationStorage.saveSettings(settings)
    ]);

    setStatus("Profile saved locally.");
  }

  async function clearProfile() {
    if (!confirm("Clear the locally stored profile?")) {
      return;
    }

    await Promise.all([
      JobApplicationStorage.saveProfile(JobApplicationStorage.DEFAULT_PROFILE),
      JobApplicationStorage.saveSettings(JobApplicationStorage.DEFAULT_SETTINGS)
    ]);

    await loadProfile();
    setStatus("Profile cleared.");
  }

  form.addEventListener("submit", saveProfile);
  document.getElementById("clearProfile").addEventListener("click", clearProfile);

  loadProfile().catch((error) => setStatus(`Failed to load profile: ${error.message}`));
})();
