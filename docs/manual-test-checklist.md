# Manual Test Checklist

Use fake profile data only. Do not test first on Workday or another real application platform.

## 1. Load the Extension in Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `C:\Users\91535\Documents\job-application-autofill-extension`.
5. Open the extension details page and enable `Allow access to file URLs` for local `file://` testing.

## 2. Open the Local Test Form

Open this file in Chrome:

```text
C:\Users\91535\Documents\job-application-autofill-extension\test\form.html
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

