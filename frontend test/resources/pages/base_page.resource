*** Settings ***
Library    Browser

*** Keywords ***
Open Alya Application
    New Browser    ${BROWSER}    headless=${HEADLESS}    slowMo=${SLOW_MO}    channel=${BROWSER_CHANNEL}    args=${BROWSER_ARGS}
    New Page    ${BASE_URL}
    Wait For Load State    domcontentloaded

Close Alya Application
    Close Browser

Wait Until Page Is Ready
    Wait For Load State    domcontentloaded

Current URL Should Contain
    [Arguments]    ${path}
    ${url}=    Get Url
    Should Contain    ${url}    ${path}

