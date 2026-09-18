*** Settings ***
Library       Browser
Library       ../execution/Execution.py
Variables     ../variables/variables.py
Resource      ../resources/common.resource
Resource      ../resources/pages/login_page.resource

Suite Setup      Before Class    ${BROWSER_CHANNEL}    ${EXECUTION_MODE}    ${REPORT_DIR}
Suite Teardown   After Class     ${REPORT_DIR}
Test Setup       Open Alya Application
Test Teardown    Close Alya Application

*** Test Cases ***
Valid user can sign in
    [Documentation]    Verifies the happy-path login flow and navigation to the protected form.
    Login With Credentials    ${APP_USERNAME}    ${APP_PASSWORD}
    Login Should Open Form Page

Invalid user remains on login page
    [Documentation]    Verifies invalid credentials do not open the protected form.
    Login With Credentials    invalid-user    invalid-password
    ${url}=    Get Url
    Should Be Equal    ${url}    ${BASE_URL}/
    ${body}=    Get Text    [data-testid="login-error"]
    Should Contain    ${body}    Identifiants invalides
