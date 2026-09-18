*** Settings ***
Library    Browser
Resource   base_page.resource

*** Keywords ***
Confirmation Should Display Submitted Data
    [Arguments]    ${case}
    ${body}=    Get Text    [data-testid="confirmation-details"]
    Should Contain    ${body}    ${case}[first_name]
    Should Contain    ${body}    ${case}[last_name]
    Should Contain    ${body}    ${case}[email]
    Should Contain    ${body}    ${case}[department]
    Should Contain    ${body}    ${case}[experience]
    Should Contain    ${body}    ${case}[role]
    Should Contain    ${body}    ${case}[comments]

Logout From Confirmation
    Click    [data-testid="logout"]
    Wait For Page To Be Ready
    ${url}=    Get Url
    Should Be Equal    ${url}    ${BASE_URL}/
