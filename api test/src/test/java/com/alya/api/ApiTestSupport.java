package com.alya.api;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import static io.restassured.RestAssured.given;

final class ApiTestSupport {
    final TestProperties properties = new TestProperties();
    private final ApiTestReportExtension report;
    private String token;

    ApiTestSupport(ApiTestReportExtension report) {
        this.report = report;
        RestAssured.baseURI = properties.value(properties.urls, "base.url");
    }

    /** Authenticates and stores the JWT in memory for protected requests. */
    Response login() {
        Response response = given()
                .contentType(contentType())
                .body(properties.body("login"))
                .post(properties.value(properties.urls, "login"));
        token = response.jsonPath().getString("token");
        return response;
    }

    /** Sends an unauthenticated POST request and records its response. */
    Response post(String endpointKey, String body) {
        begin("POST", endpointKey);
        Response response = given()
                .contentType(contentType())
                .body(body)
                .post(properties.value(properties.urls, endpointKey));
        report.capture(response);
        return response;
    }

    /** Sends an authenticated GET request and records its response. */
    Response getAuthenticated(String endpointKey) {
        begin("GET", endpointKey);
        Response response = authenticated().get(properties.value(properties.urls, endpointKey));
        report.capture(response);
        return response;
    }

    /** Sends an authenticated POST request and records its response. */
    Response postAuthenticated(String endpointKey, String body) {
        begin("POST", endpointKey);
        Response response = authenticated()
                .body(body)
                .post(properties.value(properties.urls, endpointKey));
        report.capture(response);
        return response;
    }

    /** Builds a request specification containing the current JWT. */
    private RequestSpecification authenticated() {
        return given()
                .contentType(contentType())
                .header("Authorization", "Bearer " + token);
    }

    /** Adds endpoint metadata to the report before a request is sent. */
    private void begin(String method, String endpointKey) {
        report.beginRequest(
                method,
                properties.endpoint(endpointKey),
                properties.value(properties.urls, endpointKey + ".description"));
    }

    /** Reads the configured JSON content type. */
    private String contentType() {
        return properties.value(properties.expected, "content.type");
    }
}
