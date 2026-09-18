*** Settings ***
Library    Browser
Resource   base_page.resource

*** Keywords ***
Fill Application Form
    [Arguments]    ${case}
    Fill Text    id=firstName    ${case}[first_name]
    Fill Text    id=lastName    ${case}[last_name]
    Fill Text    id=email    ${case}[email]
    Select Options By    id=department    label    ${case}[department]
    Select Options By    id=experience    label    ${case}[experience]
    Click    input[name="role"][value="${case}[role]"]
    FOR    ${interest}    IN    @{case}[interests]
        Check Checkbox    input[type="checkbox"][value="${interest}"]
    END
    Fill Text    id=comments    ${case}[comments]
    IF    '${case}[newsletter]' == 'true'
        Check Checkbox    input[name="newsletter"]
    END

Submit Application
    Click    [data-testid="form-submit"]
    Wait For Elements State    role=dialog    visible
    Click    [data-testid="confirm-submit"]

Form Should Show Confirmation
    Wait For Elements State    [data-testid="confirmation-success"]    visible
    ${url}=    Get Url
    Should Contain    ${url}    /confirmation
