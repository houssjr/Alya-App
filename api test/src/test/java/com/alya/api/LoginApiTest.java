package com.alya.api;

import io.restassured.response.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

class LoginApiTest {
    private static final ApiTestReportExtension report = new ApiTestReportExtension("login-api-test-report.html");
    private static ApiTestSupport api;

    @RegisterExtension
    static final ApiTestReportExtension REPORT = report;

    @BeforeAll
    /** Creates the shared API client and configures the login report. */
    static void setUp() {
        api = new ApiTestSupport(report);
    }

    @AfterAll
    /** Writes the report for the login endpoint test. */
    static void writeReport() throws Exception {
        report.writeReport();
    }

    @Test
    /** Verifies that valid credentials return a successful response and JWT. */
    void shouldLoginAndReturnJwtToken() {
        Response response = api.post("login", api.properties.body("login"));

        assertThat(response.statusCode(), equalTo(api.properties.integer("login.status")));
        assertThat(response.jsonPath().getBoolean("success"), equalTo(api.properties.booleanValue("login.success")));
        assertThat(response.jsonPath().getString("user"), equalTo(expected("login.user")));
        assertThat(response.jsonPath().getString("token"), notNullValue());
    }

    private String expected(String key) {
        return api.properties.value(api.properties.expected, key);
    }
}
