# Alya API Tests

Vanilla Rest Assured automation tests for the Alya Local App Bruno collection.

## Stack

- Java 17
- Maven
- JUnit 5
- Rest Assured
- Properties files for all test configuration

## Structure

```text
api test/
  pom.xml
  README.md
  PROMPT_API_TEST.md
  src/test/java/com/alya/api/AlyaApiTest.java
  src/test/java/com/alya/api/ApiTestSuiteBeforeAll.java
  src/test/java/com/alya/api/ApiTestSuiteAfterAll.java
  src/test/java/com/alya/api/LoginApiTest.java
  src/test/java/com/alya/api/SessionApiTest.java
  src/test/java/com/alya/api/FormSubmissionApiTest.java
  src/test/java/com/alya/api/LatestSubmissionApiTest.java
  src/test/java/com/alya/api/ApiTestSupport.java
  src/test/java/com/alya/api/TestProperties.java
  src/test/java/com/alya/api/ApiTestReportExtension.java
  src/test/resources/
    data.properties
    url.properties
    body.properties
    expected-response.properties
```

## Prerequisites

1. Java 17 or newer
2. Maven 3.9 or newer
3. The Alya backend running on the configured base URL

Start the backend from the project root:

```powershell
cd "..\backend"
npm install
node server.js
```

## Run the tests

From this directory:

```powershell
mvn -Dtest=AlyaApiTest test
```

`AlyaApiTest` is the aggregate JUnit suite. Each endpoint class can also be executed independently; authenticated classes perform their own login setup and keep the JWT only in memory.

Run the complete suite:

```powershell
mvn -Dtest=AlyaApiTest test
```

Run one endpoint class:

```powershell
mvn -Dtest=LoginApiTest test
mvn -Dtest=SessionApiTest test
mvn -Dtest=FormSubmissionApiTest test
mvn -Dtest=LatestSubmissionApiTest test
```

After execution, the HTML report is generated at:

```text
target/login-api-test-report.html
target/session-api-test-report.html
target/form-submission-api-test-report.html
target/latest-submission-api-test-report.html
target/api-test-suite-report.html
```

The suite report contains all four endpoint executions and the total suite duration. Each endpoint report contains the total execution duration and the test duration, endpoint URL, execution status, returned HTTP status code, response body, and failure details when applicable.

The Java code is split by responsibility: `AlyaApiTest` owns the aggregate suite execution, `ApiTestSuiteBeforeAll` and `ApiTestSuiteAfterAll` own suite lifecycle, each endpoint class contains one endpoint's assertions, `ApiTestSupport` handles requests and authentication, `TestProperties` handles externalized configuration, and `ApiTestReportExtension` handles lifecycle timing and HTML report generation.

## Configuration rule

Do not put URLs, credentials, request bodies, expected response values, or environment-specific data in the Java test class. Change those values only in the four properties files under `src/test/resources`.
