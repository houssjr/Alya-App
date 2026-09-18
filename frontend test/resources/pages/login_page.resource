*** Settings ***
Library    Browser
Resource   base_page.resource

*** Keywords ***
Login With Credentials
    [Arguments]    ${username}    ${password}
    Fill Text    id=username    ${username}
    Fill Text    id=password    ${password}
    Click    [data-testid="login-submit"]
    Wait Until Page Is Ready

Login Should Open Form Page
    Wait For Elements State    id=firstName    visible
    ${url}=    Get Url
    Should Contain    ${url}    /form
