*** Settings ***
Library       Execution.py
Variables     ../variables/variables.py

Suite Setup      Before Class    ${BROWSER_CHANNEL}    ${EXECUTION_MODE}    ${REPORT_DIR}
Suite Teardown   After Class     ${REPORT_DIR}

*** Test Cases ***
Run configured frontend tests
    Run Configured Tests    @{TEST_SUITES}    child_report_directory=${REPORT_DIR}/children
