# Alya Frontend Automation

Robot Framework end-to-end automation for the Alya React frontend using the Browser library powered by Playwright.

For the complete implementation history, setup rationale, and troubleshooting record, see [SETUP_AND_TROUBLESHOOTING.md](SETUP_AND_TROUBLESHOOTING.md).

La version française du guide est disponible dans [SETUP_AND_TROUBLESHOOTING_FR.md](SETUP_AND_TROUBLESHOOTING_FR.md).

## Stack

- Robot Framework
- Browser Library (Playwright)
- Python
- Page Object Model
- DataDriver CSV data
- Environment variables
- Native Robot Framework HTML reports
- Pabot for parallel execution
- GitHub Actions CI
- Strong locators using IDs, roles, and stable `data-testid` attributes
 - Execution suite containing only the run instruction; keep execution logic in Python classes and UI/business logic in Page Objects and child suites.

## Prerequisites

- Python 3.11+
- Node.js and npm
- The Alya backend and frontend available locally

## Install

From this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
rfbrowser init
```

On macOS/Linux, activate the environment with `source .venv/bin/activate`.

## Run locally

Start the backend in one terminal:

```powershell
cd "..\backend"
npm install
node server.js
```

Start the frontend in another terminal:

```powershell
cd "..\frontend"
npm install
npm run dev
```

Then run the browser tests from this directory:

```powershell
robot --outputdir reports tests
```

The default mode is headless:

```powershell
.\run_tests.ps1 -Mode headless
```

Run with Google Chrome:

```powershell
.\run_tests.ps1 -Browser chrome -Mode headless
```

Run with Microsoft Edge:

```powershell
.\run_tests.ps1 -Browser edge -Mode headless
```

To watch either browser, combine the browser option with headed mode:

```powershell
.\run_tests.ps1 -Browser chrome -Mode headed
.\run_tests.ps1 -Browser edge -Mode headed
```

Keep separate reports for each visible browser run:

```powershell
.\run_tests.ps1 -Browser chrome -Mode headed -ReportDirectory reports-chrome-headed
.\run_tests.ps1 -Browser edge -Mode headed -ReportDirectory reports-edge-headed
```

Chrome and Edge must be installed locally. Playwright uses the `chrome` and `msedge` browser channels while the Robot Browser Library browser engine remains `chromium`.

To watch the browser execute the tests, use headed mode:

```powershell
.\run_tests.ps1 -Mode headed
```

The legacy `-Visible` switch is also supported:

```powershell
.\run_tests.ps1 -Visible
```

Run one suite:

```powershell
robot --outputdir reports tests/login.robot
robot --outputdir reports tests/form_submission.robot
```

Run with a visible browser:

```powershell
$env:HEADLESS="false"
robot --outputdir reports tests
```

The mode is controlled by the `HEADLESS` environment variable. Set it to `true` for headless execution or `false` to see the browser.

Run in parallel with Pabot:

```powershell
pabot --outputdir reports --processes 2 tests
```

On Windows, if Python's `Scripts` directory is not on `PATH`, use the installed executable paths:

```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python314\Scripts\pabot.exe" `
  --command "$env:LOCALAPPDATA\Programs\Python\Python314\Scripts\robot.exe" `
  --end-command --outputdir reports-parallel --processes 2 tests
```

## Reports

Robot creates these files under `reports`:

- `report.html`: summary report
- `log.html`: detailed keyword and browser log
- `output.xml`: machine-readable execution result

The CI workflow uploads the `reports` directory as a GitHub Actions artifact.

## Locator strategy

Page Objects use stable selectors in this order:

1. Existing field IDs such as `id=username`, `id=email`, and `id=firstName`
2. Stable `data-testid` hooks for actions and confirmation content
3. Accessible roles only when the role/name is part of the UI contract

Avoid positional selectors, CSS classes used only for styling, arbitrary text fragments, and broad `body` selectors.

## Project structure

```text
frontend test/
  README.md
  PROMPT_FRONTEND_TEST.md
  SETUP_AND_TROUBLESHOOTING.md
  SETUP_AND_TROUBLESHOOTING_FR.md
  requirements.txt
  .env.example
  execution/Execution.py
  execution/ExecutionSuite.robot
  variables/variables.py
  variables/env.py
  data/form_cases.csv
  resources/common.resource
  resources/pages/base_page.resource
  resources/pages/login_page.resource
  resources/pages/dashboard_page.resource
  resources/pages/form_page.resource
  resources/pages/confirmation_page.resource
  tests/login.robot
  tests/form_submission.robot
```

## Execution class

`execution/Execution.py` provides the suite-level `Before Class` and `After Class` keywords. It configures Chrome or Edge, headed/headless mode, the report directory, and the maximized-window browser argument. It then closes the browser and writes execution metadata during teardown.

Robot Framework generates `report.html`, `log.html`, and `output.xml` after teardown. The Execution class also writes `execution-config.json` and `execution-teardown.txt` in the selected report directory.

## Execution suite

`execution/ExecutionSuite.robot` is the manual entry point. It contains only the suite lifecycle configuration and one instruction: `Run Configured Tests`. The execution logic stays in `Execution.py`, while UI and business scenarios stay in Page Objects and child suites under `tests/`.

Choose child suites with `TEST_SUITES`:

```powershell
$env:TEST_SUITES="tests/login.robot,tests/form_submission.robot"
.\run_tests.ps1 -Browser chrome -Mode headed
```

The parent report is written to the selected report directory. Child reports are written under its `children` subdirectory.

## Configuration

The following environment variables are supported:

- `BASE_URL`: frontend URL, default `http://127.0.0.1:5173`
- `API_URL`: backend URL, default `http://127.0.0.1:3001`
- `APP_USERNAME`: login username, default `admin`
- `APP_PASSWORD`: login password, default `admin123`
- `BROWSER`: Browser library browser, default `chromium`
- `BROWSER_CHANNEL`: installed Chromium channel, `chrome` or `msedge`; default `chrome`
- `HEADLESS`: `true` or `false`, default `true`
- `SLOW_MO`: browser delay in milliseconds, default `0`

Copy `.env.example` to `.env` for local reference. The test runner reads environment variables; it does not load `.env` automatically.

`.env.example` is intentionally kept as a safe configuration template. It documents the available variables and default local values; do not put real secrets in it. The actual `.env` file is ignored by Git.

Pabot creates `.pabotsuitenames` while planning parallel execution. It is an internal, generated suite index used to coordinate workers and is ignored by Git. It can be deleted safely; Pabot recreates it on the next parallel run.

Python may create `variables/__pycache__/*.pyc` files when loading the variables modules. These are compiled bytecode caches, not source files, and are ignored by Git. They can also be deleted safely.

## CI/CD

The workflow in `.github/workflows/frontend-tests.yml` installs Python dependencies, initializes Playwright browsers, starts the Node backend and Vite frontend, waits for both URLs, runs Robot tests in parallel with Pabot, and uploads the HTML/XML reports.

VS Code Robot Framework language-server configuration is stored in `.vscode/settings.json`:

```json
{
  "robot.language-server.python": "python"
}
```
