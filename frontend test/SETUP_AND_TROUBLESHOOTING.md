# Frontend Automation Setup and Troubleshooting Guide

This document records how the Alya frontend automation project was created, why each part exists, the commands used to install and run it, and the problems encountered during implementation.

## 1. Project goal

The goal was to automate the Alya React frontend with a maintainable browser test project using Robot Framework and Playwright through Browser Library.

The automation covers:

1. Valid login.
2. Invalid login.
3. Navigation to the protected form page.
4. Data-driven form completion.
5. Select fields, radio buttons, checkboxes, and newsletter selection.
6. Confirmation modal interaction.
7. Confirmation-page validation.
8. Headless and headed browser execution.
10. Google Chrome and Microsoft Edge execution.
11. Parallel execution with Pabot.
12. Local and GitHub Actions execution.
 12. A thin execution suite containing only the run instruction; keep execution logic in Python classes and UI/business logic in Page Objects and child suites.

The test project is intentionally separate from the application code and lives in `frontend test`.

## 2. Technology selection

### Robot Framework

Robot Framework is the test specification and execution framework.

Why it was used:

- Test cases remain readable by technical and non-technical contributors.
- Keywords make repeated browser workflows reusable.
- Native HTML and XML reports are generated automatically.
- It integrates with Browser Library, DataDriver, Pabot, and CI systems.

### Browser Library and Playwright

Browser Library provides Robot Framework keywords backed by Playwright.

Why it was used:

- Playwright provides reliable browser automation.
- Browser Library provides automatic condition-based waiting.
- Chromium, Firefox, and WebKit can be supported through the same abstraction.
- Screenshots, traces, and browser logs can be included in failure artifacts.

### Python

Python hosts Robot Framework, Browser Library, DataDriver, Pabot, and supporting libraries.

### Page Object Model

The UI behavior and selectors are separated from the test scenarios.

Why it was used:

- Selector changes are localized to page objects.
- Test cases describe business flows instead of CSS implementation details.
- Repeated actions such as login and form submission are shared.

### Data-driven testing

DataDriver reads form cases from `data/form_cases.csv`.

Why it was used:

- New form scenarios can be added without duplicating Robot test steps.
- Test values remain outside the test keywords.
- The same workflow can run against multiple records.

### CI/CD

GitHub Actions installs the dependencies, starts the application, waits for readiness, runs the browser tests, and uploads reports.

Why it was used:

- Tests run consistently on every push and pull request.
- Reports remain available when a build fails.
- The local workflow and CI workflow use the same test suites.

## 3. Project structure created

```text
frontend test/
  README.md
  PROMPT_FRONTEND_TEST.md
  SETUP_AND_TROUBLESHOOTING.md
  requirements.txt
  .env.example
  execution/
    Execution.py
    ExecutionSuite.robot
  run_tests.ps1
  variables/
    variables.py
    env.py
  data/
    form_cases.csv
  resources/
    common.resource
    pages/
      base_page.resource
      login_page.resource
      dashboard_page.resource
      form_page.resource
      confirmation_page.resource
  tests/
    login.robot
    form_submission.robot
```

Additional repository files:

```text
.vscode/settings.json
.github/workflows/frontend-tests.yml
```

## 4. Step-by-step implementation

### Step 1: Inspect the application

The existing React pages and routes were inspected before writing tests.

Important application behavior discovered:

- Login route: `/`
- Protected form route: `/form`
- Protected confirmation route: `/confirmation`
- Username field ID: `username`
- Password field ID: `password`
- Form field IDs: `firstName`, `lastName`, `email`, `department`, `experience`, and `comments`
- Role controls use `name="role"`
- Interest controls use checkbox values
- Newsletter control uses `name="newsletter"`
- The confirmation modal uses `role="dialog"`

Why this was done:

Test automation should be based on the actual application contract instead of guessed selectors.

### Step 2: Add stable application locators

Stable `data-testid` attributes were added to important actions and confirmation content:

- `login-submit`
- `login-error`
- `form-submit`
- `confirm-submit`
- `confirmation-success`
- `confirmation-details`
- `logout`

Why this was done:

Styling classes and visible text can change during UI redesigns. Explicit test IDs create an intentional automation contract and reduce test fragility.

### Step 3: Create the Python dependency file

`requirements.txt` was created with:

- `robotframework`
- `robotframework-browser`
- `robotframework-requests`
- `robotframework-datadriver`
- `robotframework-jsonlibrary`
- `robotframework-pabot`
- `pytest`

Why this was done:

A requirements file makes local setup and CI installation repeatable.

The final Browser Library version was updated to `20.4.0` because it provides Python 3.14-compatible native wheels.

### Step 4: Create environment configuration

`.env.example` documents the supported values:

- `BASE_URL`
- `API_URL`
- `APP_USERNAME`
- `APP_PASSWORD`
- `BROWSER`
- `HEADLESS`
- `SLOW_MO`

`variables/variables.py` reads these values with safe local defaults.

Why this was done:

URLs, credentials, browser mode, and timing options should be configurable without changing test cases. Real secrets should be provided by the environment or CI secret store rather than committed to Git.

### Step 5: Create the Base Page

`resources/pages/base_page.resource` contains shared browser lifecycle and synchronization keywords:

- Open the application.
- Close the browser.
- Wait for DOM readiness.
- Assert URL paths.

Why this was done:

All page objects need the same browser setup and generic navigation behavior. Keeping it in one place avoids duplication.

### Step 6: Create the Login Page

`resources/pages/login_page.resource` contains:

- Filling username and password.
- Clicking the login action with `data-testid="login-submit"`.
- Verifying navigation to `/form`.
- Verifying the form is visible.

Why this was done:

Authentication is a reusable page-level action used by both login and protected-flow tests.

### Step 7: Create the Dashboard Page

`resources/pages/dashboard_page.resource` represents the protected form page.

It contains keywords for:

- Verifying the form page is open.
- Filling text fields.
- Selecting department and experience.
- Selecting a role.
- Selecting interests.
- Selecting the newsletter option.
- Submitting the form.
- Confirming the modal.
- Waiting for confirmation content.

Why this was done:

The form is the main business workflow and deserves a dedicated page object instead of being implemented directly in the test case.

### Step 8: Keep confirmation behavior in a page object

`resources/pages/confirmation_page.resource` verifies submitted data using the stable `confirmation-details` test ID and provides logout behavior through the stable `logout` test ID.

Why this was done:

Assertions about confirmation data belong to the confirmation page object, keeping the scenario readable.

### Step 9: Create data-driven form data

`data/form_cases.csv` contains the form values used by DataDriver.

The first column is the required DataDriver test-case column:

```text
*** Test Cases ***
```

The remaining columns match the template arguments:

```text
${first_name}
${last_name}
${email}
${department}
${experience}
${role}
${interests}
${newsletter}
${comments}
```

Why this was done:

The workflow stays reusable and additional form records can be added as rows.

The suite explicitly uses UTF-8 because the form contains values such as `Intermédiaire` and `Développeur`.

### Step 10: Create the Robot test cases

`tests/login.robot` contains:

- A valid-login test.
- An invalid-login test.

`tests/form_submission.robot` contains a DataDriver template that:

1. Opens the application.
2. Logs in.
3. Fills the CSV-provided form data.
4. Confirms the submission modal.
5. Verifies the confirmation page.
6. Verifies the submitted values.

Why this was done:

The test files should describe scenarios and expected behavior, not implementation details.

### Step 11: Avoid hard waits

No `Sleep`, `sleep`, or `Start-Sleep` calls are used in the browser tests or CI readiness logic.

The tests use condition-based synchronization:

- `Wait For Load State`
- `Wait For Elements State`
- Stable confirmation elements
- URL assertions after the confirmation element is visible

GitHub Actions uses `wait-on` for application readiness instead of a loop with fixed sleeps.

Why this was done:

Hard waits make tests slow when the application is ready early and unreliable when the application needs longer than the chosen delay.

### Step 12: Use strong locators

The locator strategy is:

1. Existing semantic field IDs.
2. Stable `data-testid` attributes for actions and key content.
3. Accessible roles when they are part of the UI contract.

Avoided locator types:

- Positional selectors.
- Styling-only classes.
- Broad `body` assertions.
- Arbitrary text fragments.
- Fragile DOM traversal.

Why this was done:

Strong locators communicate intent and survive layout and styling changes better than incidental selectors.

### Step 13: Add headless and headed modes

`run_tests.ps1` supports:

```powershell
.\run_tests.ps1 -Mode headless
.\run_tests.ps1 -Mode headed
.\run_tests.ps1 -Visible
```

The default is headless. Headed mode sets `HEADLESS=false`, allowing the user to watch Playwright execute the test.

Why this was done:

Headless mode is best for CI and fast local runs. Headed mode is useful when debugging selectors, navigation, or browser behavior visually.

The runner also resolves Python's `Scripts` directory directly when it is not on `PATH`.

### Step 14: Add Chrome and Edge browser modes

The browser engine is configured as Chromium and the installed browser channel is selected with `BROWSER_CHANNEL`:

```text
BROWSER_CHANNEL=chrome
BROWSER_CHANNEL=msedge
```

The PowerShell runner exposes this as:

```powershell
.\run_tests.ps1 -Browser chrome -Mode headless
.\run_tests.ps1 -Browser edge -Mode headless
.\run_tests.ps1 -Browser chrome -Mode headed
.\run_tests.ps1 -Browser edge -Mode headed
```

Why this was done:

Chrome and Edge are both Chromium-based, so the same page objects and test scenarios can be reused. The channel option selects the installed branded browser without duplicating the test suites.

Chrome and Edge must be installed on the machine running the tests. CI runners should install or provision the requested browser channels before running a browser matrix.

### Step 15: Add parallel execution

Pabot is installed through `requirements.txt` and can run the suites in parallel:

```powershell
pabot --outputdir reports --processes 2 tests
```

On Windows installations where Python Scripts is not on `PATH`, the runner uses the absolute `pabot.exe` and `robot.exe` paths.

Why this was done:

Parallel execution reduces feedback time as the suite grows.

### Step 16: Add VS Code configuration

`.vscode/settings.json` contains:

```json
{
  "robot.language-server.python": "python"
}
```

Why this was done:

It tells the Robot Framework language server which Python interpreter command to use for discovery and analysis.

### Step 17: Add GitHub Actions CI/CD

`.github/workflows/frontend-tests.yml` performs these steps:

1. Checks out the repository.
2. Installs Python 3.12.
3. Installs Node.js 20.
4. Runs `npm ci` for the backend.
5. Runs `npm ci` for the frontend.
6. Installs Robot Framework requirements.
7. Runs `rfbrowser init`.
8. Starts the backend.
9. Starts the Vite frontend.
10. Uses `wait-on` for service readiness.
11. Runs Pabot in headless mode.
12. Uploads Robot reports even when tests fail.

Why this was done:

The same automation should run consistently on pull requests and pushes to `main`.

### Step 18: Add the Execution class

`execution/Execution.py` is a Robot Framework Python library used by each suite.

Its `Before Class` keyword validates the browser and mode, maps `edge` to Playwright's `msedge` channel, sets suite variables, creates the report directory, writes `execution-config.json`, and requests a maximized browser window.

Its `After Class` keyword closes any remaining browser and writes `execution-teardown.txt`. Robot Framework then generates the native `report.html`, `log.html`, and `output.xml` files after teardown.

`execution/ExecutionSuite.robot` is intentionally a thin entry point. It contains no browser or business logic; it only invokes `Run Configured Tests`. The implementation remains in `Execution.py`, the Page Objects, and the child suites under `tests/`.

Child suites can be selected through `TEST_SUITES`:

```powershell
$env:TEST_SUITES="tests/login.robot,tests/form_submission.robot"
```

The parent report is written to the selected report directory and child reports are written under `children/`.

## 5. Installation commands

From `frontend test`:

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
rfbrowser init
rfbrowser --help
```

The requested libraries are covered by `requirements.txt`:

```powershell
pip install robotframework
pip install robotframework-browser
pip install robotframework-requests
pip install robotframework-datadriver
pip install robotframework-jsonlibrary
pip install robotframework-pabot
```

## 6. Running the application locally

Terminal 1, backend:

```powershell
cd "..\backend"
npm install
node server.js
```

Terminal 2, frontend:

```powershell
cd "..\frontend"
npm install
npm run dev
```

Terminal 3, browser tests:

```powershell
cd "..\frontend test"
.\run_tests.ps1 -Mode headless
```

To see the browser:

```powershell
.\run_tests.ps1 -Mode headed
```

## 7. Reports

Robot generates:

- `reports/report.html`: high-level report.
- `reports/log.html`: detailed keyword execution log.
- `reports/output.xml`: machine-readable result.
- `reports/browser/`: Browser Library artifacts when generated.

Pabot generates equivalent files under `reports-parallel` when that output directory is selected.

Reports are excluded from Git by the root `.gitignore`.

## 8. Problems encountered and fixes

### Problem 1: Python command was unavailable

#### Symptom

Running `python --version` returned the Microsoft Store message instead of a Python version.

#### Cause

Windows had the `python.exe` execution alias enabled, but the real Python installation was not available on `PATH`.

#### Fix

The actual interpreter was located at:

```text
C:\Users\houss\AppData\Local\Programs\Python\Python314\python.exe
```

The runner was made resilient by checking the real local installation and resolving its `Scripts` directory directly.

Recommended permanent fix:

- Add Python to PATH during installation, or
- Disable the Microsoft Store Python execution aliases, then reopen VS Code.

### Problem 2: Browser Library version could not install cleanly on Python 3.14

#### Symptom

The original Browser Library dependency attempted to build `grpcio` from source and failed during native compilation.

#### Cause

The pinned dependency version required a grpcio release without a compatible Python 3.14 Windows wheel.

#### Fix

Browser Library was updated to `20.4.0`, which uses `grpcio 1.83.0` and provides Python 3.14-compatible wheels.

Robot Framework was pinned to `7.3.2`, which worked with DataDriver and the updated Browser Library.

### Problem 3: Python Scripts directory was not on PATH

#### Symptom

Python installed the executables, but commands such as `robot`, `pabot`, and `rfbrowser` were not recognized from PowerShell.

#### Cause

The installation directory was not included in PATH.

#### Fix

The executable paths were invoked directly from:

```text
%LOCALAPPDATA%\Programs\Python\Python314\Scripts
```

`run_tests.ps1` now resolves these paths automatically.

### Problem 4: PowerShell execution policy blocked npm

#### Symptom

Starting the frontend with `npm run dev` failed because `npm.ps1` could not be loaded.

#### Cause

PowerShell script execution was restricted by the local execution policy.

#### Fix

The Windows command shim was used:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

This bypasses the blocked PowerShell wrapper without changing the machine-wide policy.

### Problem 5: DataDriver did not generate the form test

#### Symptom

DataDriver reported:

```text
Unassigned requiered argument detected: ${first_name}
```

#### Cause

The CSV did not initially follow DataDriver's required structure. DataDriver requires the first column to be `*** Test Cases ***` and the argument columns to match the template variables exactly.

#### Fix

The CSV was changed to:

```text
*** Test Cases ***,${first_name},${last_name},${email},${department},${experience},${role},${interests},${newsletter},${comments}
```

The Robot test was also simplified to a template-only test case, allowing DataDriver to supply the row arguments.

### Problem 6: French form values were corrupted

#### Symptom

`Intermédiaire` was read as `IntermÃ©diaire`, so the select option could not be found.

#### Cause

DataDriver was using an encoding that did not match the UTF-8 CSV file.

#### Fix

The suite explicitly sets:

```robot
Library    DataDriver    file=../data/form_cases.csv    dialect=excel    encoding=utf-8
```

### Problem 7: Browser test used a missing keyword

#### Symptom

Robot reported that `Wait For Page To Be Ready` did not exist.

#### Cause

The Base Page keyword was renamed to `Wait Until Page Is Ready`, but the Login Page still called the old name.

#### Fix

The Login Page was updated to call the Base Page keyword that actually exists.

### Problem 8: SPA navigation was asserted too early

#### Symptom

The form test checked `/confirmation` while the browser was still on `/form`.

#### Cause

React navigation and data loading had not completed when the URL assertion ran.

#### Fix

The test first waits for the stable `[data-testid="confirmation-success"]` element, then reads and asserts the URL. This is a condition-based wait, not a fixed sleep.

### Problem 9: Pabot workers could not find Robot

#### Symptom

Pabot started parallel workers, but each worker reported that `robot` was not recognized.

#### Cause

Pabot was available through its absolute path, while the Robot executable was not on PATH inside the worker environment.

#### Fix

Pabot was run with:

```powershell
pabot.exe --command robot.exe --end-command ...
```

The project runner resolves both executable paths automatically.

### Problem 10: Relative test paths failed from the repository root

#### Symptom

Running the PowerShell runner from the repository root caused Robot to search for a non-existent root-level `tests` directory.

#### Cause

The script used relative paths based on the caller's current directory.

#### Fix

`run_tests.ps1` now changes to `$PSScriptRoot` before executing, so it can be launched from any directory.

### Problem 11: Broad and fragile locators

#### Symptom

Selectors based on text, styling, or broad page content could break after harmless UI changes.

#### Cause

Those selectors describe incidental implementation details rather than the application's automation contract.

#### Fix

Stable field IDs and explicit `data-testid` attributes were added and used for important actions and assertions.

### Problem 12: Fixed waits would make CI unreliable

#### Symptom

A fixed sleep could be too short on a busy CI runner or waste time on a fast local run.

#### Cause

Fixed-duration waits do not observe application state.

#### Fix

Browser Library condition-based waits and `wait-on` service readiness checks are used instead of `Sleep`, `sleep`, or `Start-Sleep`.

## 9. Validation performed

The final local validation included:

```text
Serial Robot execution: 3 tests, 3 passed, 0 failed
Headless mode: 3 tests, 3 passed, 0 failed
Headed mode: 3 tests, 3 passed, 0 failed
Pabot parallel execution: 2 suites, 2 passed, 0 failed
Edge headless execution: 3 tests, 3 passed, 0 failed
Chrome headless execution: 3 tests, 3 passed, 0 failed

### Problem 13: Edge checked the URL before React navigation completed

#### Symptom

The Edge valid-login test occasionally or consistently saw `/` instead of `/form`, while the form flow itself could pass.

#### Cause

The URL assertion ran before the protected form page had become visible. Browser timing differed between Chrome and Edge.

#### Fix

The Login Page now waits for the stable `id=firstName` form field to become visible before reading and asserting the URL. This is a condition-based synchronization and does not use a fixed wait.
```

The React frontend build also completed successfully after adding the test IDs.

## 10. Maintenance guidance

When adding a new frontend flow:

1. Inspect the route and accessible controls.
2. Add stable IDs or test IDs only where the UI lacks a strong locator.
3. Add or update a page object.
4. Add test data externally when the flow is data-driven.
5. Use condition-based waits.
6. Add a focused Robot suite.
7. Run the suite headless and headed.
8. Run the parallel command when the suite is safe to parallelize.
9. Update the README and this troubleshooting guide if setup behavior changes.
