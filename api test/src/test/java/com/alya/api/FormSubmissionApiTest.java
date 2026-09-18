package com.alya.api;

import io.restassured.response.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

class FormSubmissionApiTest {
    private static final ApiTestReportExtension report = new ApiTestReportExtension("form-submission-api-test-report.html");
    private static ApiTestSupport api;

    @RegisterExtension
    static final ApiTestReportExtension REPORT = report;

    @BeforeAll
    /** Logs in once so the form submission test can run independently. */
    static void setUp() {
        api = new ApiTestSupport(report);
        Response login = api.login();
        assertThat(login.statusCode(), equalTo(api.properties.integer("login.status")));
    }

    @AfterAll
    /** Writes the report for the form submission endpoint test. */
    static void writeReport() throws Exception {
        report.writeReport();
    }

    @Test
    /** Verifies that an authenticated form payload is accepted and stored. */
    void shouldSubmitForm() {
        Response response = api.postAuthenticated("forms", api.properties.body("form"));

        assertThat(response.statusCode(), equalTo(api.properties.integer("form.status")));
        assertThat(response.jsonPath().getBoolean("success"), equalTo(api.properties.booleanValue("form.success")));
        assertThat(response.jsonPath().getString("message"), equalTo(expected("form.message")));
    }

    private String expected(String key) {
        return api.properties.value(api.properties.expected, key);
    }
}
