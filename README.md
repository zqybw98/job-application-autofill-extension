# Job Application Autofill Extension

A privacy-first local Chrome Extension for autofilling repetitive job application forms.

The extension detects common form fields on job application pages and fills them with locally stored profile data after explicit user action. It is designed for manual review before submission and does not submit applications automatically.

## Key Features

- User-triggered autofill from the extension popup
- Local profile storage with `chrome.storage.local`
- DOM-based field detection for common English and German labels
- Support for `input`, `textarea`, `select`, `radio`, and `checkbox` controls
- Local application dashboard for manual tracking
- No Gmail access
- No analytics
- No external API calls
- No automatic application submission

## What This Extension Does

- Stores a reusable profile locally in Chrome.
- Detects likely job application fields from labels, placeholders, names, IDs, ARIA labels, and nearby text.
- Fills confident matches only after the user clicks `Fill current page`.
- Shows detected field mappings for manual review.
- Lets the user manually save application records in a local dashboard.

## What This Extension Does Not Do

- It does not submit applications.
- It does not bypass logins, CAPTCHA, file upload restrictions, or platform rules.
- It does not set file input values.
- It does not connect to Gmail, Google Drive, OpenAI APIs, analytics, or any third-party service.
- It does not upload profile or application data to external servers.

## Privacy-First Design

All profile and dashboard data is stored locally with `chrome.storage.local`. The extension requests only the permissions needed for v0.1:

- `storage`
- `activeTab`
- `scripting`

There are no host permissions. Autofill scripts are injected only when the user clicks a popup button.

## Install Locally

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select this project folder: `job-application-autofill-extension`.
6. Pin `Job Application Autofill` from the extensions menu if needed.

## Usage

1. Open the extension popup.
2. Click `Open profile` and save local profile fields.
3. Open a job application page.
4. Click the extension icon.
5. Click `Show detected fields` to inspect mappings.
6. Click `Fill current page` to fill confident matches.
7. Review the page manually before submitting anything.
8. Click `Open dashboard` to save the current application page locally.

## Development Status

Version `0.1.0` is an initial MVP. It focuses on safe local behavior, generic field detection, manual review, and a lightweight local dashboard.

## Roadmap

- Improve confidence scoring with more real-world form examples.
- Add careful platform-specific hints for Workday, Greenhouse, Lever, Personio, SmartRecruiters, and Ashby.
- Add import/export for local profile and application records.
- Add manual test cases for common application platforms.
- Improve dashboard filtering and editing.

## Project Structure

```text
job-application-autofill-extension/
  README.md
  PRIVACY.md
  SECURITY.md
  CHANGELOG.md
  AGENTS.md
  .gitignore
  manifest.json
  src/
    popup.html
    popup.js
    options.html
    options.js
    dashboard.html
    dashboard.js
    storage.js
    fieldDetector.js
    autofillEngine.js
    applicationTracker.js
    adapters/
      generic.js
      workday.js
      greenhouse.js
      lever.js
      personio.js
      smartrecruiters.js
      ashby.js
  examples/
    profile.example.json
  docs/
    screenshots/
      .gitkeep
```

