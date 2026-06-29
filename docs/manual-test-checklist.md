# Manual Test Checklist

Use fake profile data only. Do not test first on Workday or another real application platform.

## 1. Load the Extension in Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `<path-to-repo>\job-application-autofill-extension`.
5. Open the extension details page and enable `Allow access to file URLs` for local `file://` testing.

## 2. Open the Local Test Form

Open this file in Chrome:

```text
<path-to-repo>\job-application-autofill-extension\test\form.html
```

The browser URL should start with `file:///`.

## 3. Save Fake Profile Data

1. Click the extension icon.
2. Click `Open profile`.
3. Enter fake profile values such as:
   - firstName: `Max`
   - lastName: `Mustermann`
   - email: `max.mustermann@example.com`
   - phone: `+49 000 00000000`
   - city: `Berlin`
   - country: `Germany`
   - linkedin: `https://www.linkedin.com/in/example`
   - highestDegree: `Master's degree`
   - fieldOfStudy: `Computational Engineering`
   - germanLevel: `C1`
   - englishLevel: `C1`
   - availabilityDate: `2026-10-01`
   - workAuthorization: `Eligible to work in Germany`
   - requiresSponsorship: unchecked or checked depending on the test case
4. Click `Save profile`.
5. Refresh the options page and confirm the values are still present.

## 4. Show Detected Fields

1. Return to `test/form.html`.
2. Click the extension icon.
3. Click `Show detected fields`.
4. Confirm that common fields are mapped, including:
   - `firstName`
   - `lastName`
   - `email`
   - `phone`
   - `city`
   - `country`
   - `linkedin`
   - `highestDegree`
   - `fieldOfStudy`
   - `germanLevel`
   - `englishLevel`
   - `availabilityDate`
   - `workAuthorization`
   - `requiresSponsorship`

## 5. Fill Current Page

1. Keep `test/form.html` open.
2. Click the extension icon.
3. Click `Fill current page`.
4. Confirm the form fields are filled with fake profile data.
5. Confirm the summary shows detected, filled, skipped, and mapped fields.

## 6. Verify Empty-Field Protection

1. Manually enter a different value into one field, such as `City / Stadt`.
2. Make sure `Allow overwriting non-empty fields` is disabled in the options page.
3. Click `Fill current page` again.
4. Confirm the manually entered value is not overwritten.

## 7. Confirm Submit Is Never Automatic

1. Watch the `Submit application manually` button during autofill.
2. Confirm the extension does not click it.
3. Confirm the page does not navigate or submit unless you click the button yourself.

## 8. Test the Dashboard

1. Click the extension icon.
2. Click `Open dashboard`.
3. Enter fake company and role data.
4. Click `Save`.
5. Confirm the application appears in `Recent Applications`.
6. Change its status and confirm the counters update.

## 9. Check Chrome Console

Open DevTools on the popup, options page, dashboard, and test form when needed. Confirm there are no obvious red runtime errors.

## 10. German ATS Field Coverage

Open this file in Chrome:

```text
<path-to-repo>\job-application-autofill-extension\test\german-ats-form.html
```

Use fake profile values only. In addition to the basic profile fields, save optional values such as:

- phoneCountryCode: `+49`
- phoneLocalNumber: `0000000000`
- streetAddress: `Example Street 1`
- postalCode: `10115`
- city: `Berlin`
- country: `Germany`
- university: `Example University`
- locationPreference1: `Berlin`
- locationPreference2: `Munich`
- travelReadiness: `Yes`
- salaryExpectation: `60000 EUR`
- noticePeriodOrStartDate: `2026-10-01`

Then test:

1. Click `Show detected fields`.
2. Confirm German labels are mapped, including `Vorname`, `Nachname`, `Private E-Mail`, `Ländercode`, `Telefonnummer`, `Straße und Hausnummer`, `Postleitzahl`, `Stadt`, `Standortwahl Priorität 1`, `Deutschkenntnisse`, `Englischkenntnisse`, `Reisebereitschaft`, `Gewünschter Starttermin oder Kündigungsfrist`, and `Erwartetes Jahresgehalt`.
3. Confirm `Stadt` maps to `city` and is not filled with `Germany`.
4. Confirm `Lebenslauf` and `Upload der Zeugnisse` show `manual upload required` and file inputs stay empty.
5. Click `Fill current page`.
6. Confirm select values such as `Berlin`, `Germany`, `C1`, and `Yes / Ja` are matched case-insensitively.
7. Confirm sensitive fields such as `Geschlecht`, `Geburtsdatum`, `Nationalität`, `Talent pool consent`, and `Schwerbehinderung / Gleichstellung` are skipped unless you explicitly saved local profile values for them.
8. Confirm legal or consent radio buttons are not selected by default.
9. Confirm the submit button is never clicked automatically.
