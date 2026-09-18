*** Settings ***
Library    Browser
Resource   base_page.resource

*** Keywords ***
Dashboard Should Be Open
    Current URL Should Contain    /form
    Wait For Elements State    id=firstName    visible

Fill Dashboard Form
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

Submit Dashboard Form
    Click    [data-testid="form-submit"]
    Wait For Elements State    role=dialog    visible
    Click    [data-testid="confirm-submit"]
    Wait For Elements State    [data-testid="confirmation-success"]    visible
    Current URL Should Contain    /confirmation
