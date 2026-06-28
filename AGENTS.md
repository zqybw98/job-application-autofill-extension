# Project Instructions

## Scope

This is a privacy-first local Chrome Extension for autofilling repetitive job application forms after explicit user action.

## Coding Rules

- Make minimal, targeted changes.
- Avoid unrelated refactoring, formatting churn, dependency changes, or cleanup.
- Use plain JavaScript, HTML, and CSS.
- Do not add React, build tooling, bundlers, or external dependencies unless explicitly requested.
- Keep files small and readable.
- Add comments only where they clarify non-obvious behavior.

## Privacy and Safety Rules

- Never add telemetry, analytics, tracking, or external logging.
- Never add external API calls without an explicit user request.
- Never connect Gmail, Google Drive, OpenAI APIs, or third-party services unless explicitly requested.
- Never commit real personal data, CVs, cover letters, certificates, secrets, `.env`, or `profile.json`.
- Never auto-submit applications.
- Never click submit buttons automatically.
- Never set file input values programmatically.
- Keep all profile and application data local in `chrome.storage.local`.

## Verification

Before changing behavior, inspect the relevant files first. After changes, run the most relevant available checks, such as JavaScript syntax checks, manifest JSON parsing, and a manual unpacked-extension smoke test when Chrome is available.

