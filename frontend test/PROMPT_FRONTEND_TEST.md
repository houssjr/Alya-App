# Prompt: Alya Frontend Robot Framework Automation

Create a maintainable frontend end-to-end automation project for Alya Local App.

## Required stack

- Robot Framework
- Browser Library powered by Playwright
- Python
- Page Object Model using `.resource` files
- Data-driven testing using Robot Framework DataDriver and CSV data
- Environment configuration through environment variables
- Native Robot Framework HTML/XML reporting
- Pabot for optional parallel execution
- GitHub Actions CI/CD
- pytest may be installed for supporting Python tooling, but Robot Framework remains the test runner and report owner

## Application flow to automate

1. Open the React frontend at the configured `BASE_URL`.
2. Log in with configured credentials.
3. Verify navigation to `/form`.
4. Fill text inputs, selects, radio buttons, interests checkboxes, newsletter checkbox, and comments.
5. Submit the form and confirm the modal.
6. Verify navigation to `/confirmation`.
7. Verify the submitted values are displayed.
8. Verify invalid login credentials remain on the login page.

## Design requirements

- Keep page selectors and UI actions in Page Object resource files.
- Keep test scenarios in `.robot` files.
- Keep test data in CSV or equivalent external data files.
- Keep URLs and credentials in environment configuration; never hardcode environment-specific URLs in test cases.
- Use reusable keywords for application startup, login, form submission, confirmation, and logout.
- Use strong locators: field IDs, explicit `data-testid` hooks, and accessible role/name locators.
- Do not use positional selectors, styling classes, arbitrary text fragments, or broad `body` selectors for assertions.
- Support headless and headed browser execution.
- Support Google Chrome and Microsoft Edge through Playwright browser channels.
- Keep the browser engine as Chromium and configure the channel with `BROWSER_CHANNEL=chrome` or `BROWSER_CHANNEL=msedge`.
- Make headless execution the default and provide a clear headed mode for local visual debugging.
- Read the browser mode from the `HEADLESS` environment variable and avoid hard-coded execution mode in test cases.
- Store generated reports under `reports/` and exclude them from Git.
- Provide local PowerShell execution and GitHub Actions execution.
- Provide a thin execution suite containing only the run instruction; keep execution logic in Python classes and UI/business logic in Page Objects and child suites.
- Allow the execution suite to select child suites through `TEST_SUITES`.

## Installation

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
rfbrowser init
```

## Execution

```powershell
robot --outputdir reports tests
pabot --outputdir reports --processes 2 tests
```

On Windows, when Python's `Scripts` directory is not on `PATH`, invoke `pabot.exe` and pass the absolute `robot.exe` path using `--command ... --end-command`.

## CI requirements

The GitHub Actions workflow must install Node and Python dependencies, initialize Browser Library browsers, start the backend and frontend, wait for both services, run Robot tests, and upload `reports/` even when tests fail.
