*** Settings ***
Library       Browser
Library       ../execution/Execution.py
Library       DataDriver    file=../data/form_cases.csv    dialect=excel    encoding=utf-8
Library       String
Library       Collections
Variables     ../variables/variables.py
Resource      ../resources/common.resource
Resource      ../resources/pages/login_page.resource
Resource      ../resources/pages/dashboard_page.resource
Resource      ../resources/pages/confirmation_page.resource

Suite Setup      Before Class    ${BROWSER_CHANNEL}    ${EXECUTION_MODE}    ${REPORT_DIR}
Suite Teardown   After Class     ${REPORT_DIR}
Test Template    Submit Form Case
Test Setup       Open Alya Application
Test Teardown    Close Alya Application

*** Test Cases ***
Submit form with ${first_name} ${last_name}

*** Keywords ***
Submit Form Case
    [Arguments]    ${first_name}    ${last_name}    ${email}    ${department}    ${experience}    ${role}    ${interests}    ${newsletter}    ${comments}
    Login With Credentials    ${APP_USERNAME}    ${APP_PASSWORD}
    Login Should Open Form Page
    ${interest_list}=    Split String    ${interests}    |
    ${case}=    Create Dictionary
    ...    first_name=${first_name}
    ...    last_name=${last_name}
    ...    email=${email}
    ...    department=${department}
    ...    experience=${experience}
    ...    role=${role}
    ...    interests=${interest_list}
    ...    newsletter=${newsletter}
    ...    comments=${comments}
    Fill Dashboard Form    ${case}
    Submit Dashboard Form
    Confirmation Should Display Submitted Data    ${case}
