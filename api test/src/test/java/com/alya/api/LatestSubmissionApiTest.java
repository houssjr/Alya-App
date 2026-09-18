package com.alya.api;

import io.restassured.response.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

class LatestSubmissionApiTest {
    private static final ApiTestReportExtension report = new ApiTestReportExtension("latest-submission-api-test-report.html");
    private static ApiTestSupport api;

    @RegisterExtension
    static final ApiTestReportExtension REPORT = report;

    @BeforeAll
    /** Logs in and creates known data so this retrieval test is fully independent. */
    static void setUp() {
        api = new ApiTestSupport(report);
        Response login = api.login();
        assertThat(login.statusCode(), equalTo(api.properties.integer("login.status")));
        Response submission = api.postAuthenticated("forms", api.properties.body("form"));
        assertThat(submission.statusCode(), equalTo(api.properties.integer("form.status")));
    }

    @AfterAll
    /** Writes the report for the latest-submission endpoint test. */
    static void writeReport() throws Exception {
        report.writeReport();
    }

    @Test
    /** Verifies that the API returns the most recently submitted form values. */
    void shouldReturnLatestSubmission() {
        Response response = api.getAuthenticated("latest.form");

        assertThat(response.statusCode(), equalTo(api.properties.integer("latest.status")));
        assertThat(response.jsonPath().getBoolean("success"), equalTo(api.properties.booleanValue("latest.success")));
        assertThat(response.jsonPath().getString("submission.first_name"), equalTo(expected("latest.first.name")));
        assertThat(response.jsonPath().getString("submission.last_name"), equalTo(expected("latest.last.name")));
        assertThat(response.jsonPath().getString("submission.email"), equalTo(expected("latest.email")));
        assertThat(response.jsonPath().getString("submission.department"), equalTo(expected("latest.department")));
        assertThat(response.jsonPath().getString("submission.experience"), equalTo(expected("latest.experience")));
        assertThat(response.jsonPath().getString("submission.role"), equalTo(expected("latest.role")));
        assertThat(response.jsonPath().getBoolean("submission.newsletter"), equalTo(api.properties.booleanValue("latest.newsletter")));
        assertThat(response.jsonPath().getString("submission.comments"), equalTo(expected("latest.comments")));
    }

    private String expected(String key) {
        return api.properties.value(api.properties.expected, key);
    }
}
