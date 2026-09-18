package com.alya.api;

import io.restassured.response.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

class SessionApiTest {
    private static final ApiTestReportExtension report = new ApiTestReportExtension("session-api-test-report.html");
    private static ApiTestSupport api;

    @RegisterExtension
    static final ApiTestReportExtension REPORT = report;

    @BeforeAll
    /** Logs in once so this class can test the protected session endpoint independently. */
    static void setUp() {
        api = new ApiTestSupport(report);
        Response login = api.login();
        assertThat(login.statusCode(), equalTo(api.properties.integer("login.status")));
    }

    @AfterAll
    /** Writes the report for the session endpoint test. */
    static void writeReport() throws Exception {
        report.writeReport();
    }

    @Test
    /** Verifies that the JWT identifies the authenticated user. */
    void shouldVerifyAuthenticatedSession() {
        Response response = api.getAuthenticated("me");

        assertThat(response.statusCode(), equalTo(api.properties.integer("me.status")));
        assertThat(response.jsonPath().getBoolean("success"), equalTo(api.properties.booleanValue("me.success")));
        assertThat(response.jsonPath().getString("user.username"), equalTo(expected("me.username")));
    }

    private String expected(String key) {
        return api.properties.value(api.properties.expected, key);
    }
}
