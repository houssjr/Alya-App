# Prompt: Alya API Test Automation

Create and maintain a vanilla Rest Assured API automation module for the Alya Local App based on the Bruno collection in `BrunoCollection`.

## Technical requirements

- Create the module in `api test`.
- Use Java 17 and Maven.
- Use Rest Assured for HTTP calls and JUnit 5 for test execution.
- Do not use Cucumber, Spring Boot, a code generator, or a proprietary test framework.
- Cover the Bruno flow:
  1. Login with `POST /api/login`.
  2. Verify the authenticated session with `GET /api/me`.
  3. Submit the form with `POST /api/forms`.
  4. Retrieve the latest submission with `GET /api/forms/latest`.
- Create one independently runnable JUnit class per endpoint flow.
- Keep `AlyaApiTest` as an aggregate JUnit suite that selects all endpoint test classes.
- Authenticated endpoint classes must perform their own login setup and must not depend on another test class running first.
- Preserve test order where the login token is required by later calls.
- Keep the JWT in memory during the test run; do not persist tokens in a file.

## Configuration and data separation

The Java test class must contain no literal:

- URL or endpoint
- username or password
- request data
- request body
- expected status code
- expected response value or response body

All configuration must be loaded from `src/test/resources`:

- `data.properties`: credentials and form data
- `url.properties`: base URL and endpoint paths
- `body.properties`: request JSON templates using placeholders from `data.properties`
- `expected-response.properties`: status codes and response body assertions

Use a small placeholder resolver so request and expected-response templates can reference data properties. Keep assertions explicit and readable while taking their values from the properties files.

## Quality requirements

- Fail clearly when a required property is missing.
- Use UTF-8 resource loading so French API values are supported.
- Assert response status and relevant response body fields.
- Avoid logging credentials or JWT values.
- Keep the module runnable with `mvn test` from the `api test` directory.
- Document prerequisites, backend startup, test execution, folder layout, and configuration rules in `api test/README.md`.

## Execution report requirements

Add an after-test execution reporting lifecycle:

- Generate an HTML report after the complete test suite finishes.
- Write the report to `target/api-test-report.html`.
- Include total suite duration.
- For every test, include test name, duration, endpoint URL, execution status, returned HTTP status code, response body, and failure details when available.
- Escape response content before inserting it into HTML.
- Keep report generation independent from the request data and expected-value property files.

## Aggregate suite lifecycle

- `AlyaApiTest` must be executable as the aggregate suite entry point.
- Add an explicit suite-before lifecycle class and suite-after lifecycle class.
- The suite-before lifecycle starts suite timing before endpoint execution.
- The suite-after lifecycle writes `target/api-test-suite-report.html` after all endpoint classes finish.
- The aggregate report must include all endpoint executions, their individual durations, and the total suite duration.
