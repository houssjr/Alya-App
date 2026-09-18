package com.alya.api;

import io.restassured.response.Response;
import org.junit.jupiter.api.extension.AfterTestExecutionCallback;
import org.junit.jupiter.api.extension.BeforeTestExecutionCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class ApiTestReportExtension implements BeforeTestExecutionCallback, AfterTestExecutionCallback {
    private static final DateTimeFormatter REPORT_TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'").withZone(ZoneOffset.UTC);
    private final Path reportPath;
    private static final List<TestReportEntry> suiteEntries = new ArrayList<>();
    private final List<TestReportEntry> entries = new ArrayList<>();
    private final Map<String, Instant> startTimes = new HashMap<>();
    private String method = "N/A";
    private String endpoint = "Not reached";
    private String description = "Not reached";
    private Response response;

    /** Creates a reporter that writes to the supplied report file. */
    ApiTestReportExtension(String reportFileName) {
        reportPath = Path.of("target", reportFileName);
    }

    /** Stores the method, URL, and purpose for the request about to run. */
    void beginRequest(String method, String endpoint, String description) {
        this.method = method;
        this.endpoint = endpoint;
        this.description = description;
    }

    /** Stores the HTTP response so it can be included in the report. */
    void capture(Response response) {
        this.response = response;
    }

    @Override
    /** Starts timing the current test before its request and assertions execute. */
    public void beforeTestExecution(ExtensionContext context) {
        startTimes.put(context.getUniqueId(), Instant.now());
    }

    @Override
    /** Captures status, timing, endpoint metadata, and response details after the test. */
    public void afterTestExecution(ExtensionContext context) {
        Instant start = startTimes.remove(context.getUniqueId());
        long duration = start == null ? 0 : Duration.between(start, Instant.now()).toMillis();
        String status = context.getExecutionException().isPresent() ? "FAILED" : "PASSED";
        String details = context.getExecutionException().map(Throwable::getMessage).orElse("");
        int statusCode = response == null ? 0 : response.statusCode();
        String responseBody = response == null ? "No response received" : response.asString();

        TestReportEntry entry = new TestReportEntry(
                context.getDisplayName(), status, duration, method, endpoint,
            description, statusCode, responseBody, details);
        entries.add(entry);
        suiteEntries.add(entry);
        resetRequest();
    }

    /** Writes this endpoint class report to the target directory. */
    void writeReport() throws IOException {
        Files.createDirectories(reportPath.getParent());
        Files.writeString(reportPath, render(), StandardCharsets.UTF_8);
    }

    /** Writes the combined report produced by the aggregate suite. */
    static void writeSuiteReport(Instant suiteStart) throws IOException {
        ApiTestReportExtension suiteReport = new ApiTestReportExtension("api-test-suite-report.html");
        Files.createDirectories(suiteReport.reportPath.getParent());
        long duration = Duration.between(suiteStart, Instant.now()).toMillis();
        Files.writeString(suiteReport.reportPath, suiteReport.render(suiteEntries, duration), StandardCharsets.UTF_8);
    }

    /** Clears request-specific state before the next test starts. */
    private void resetRequest() {
        response = null;
        method = "N/A";
        endpoint = "Not reached";
        description = "Not reached";
    }

    /** Renders the endpoint class entries as an HTML document. */
    private String render() {
        long totalDuration = entries.stream().mapToLong(TestReportEntry::durationMs).sum();
        return render(entries, totalDuration);
    }

    /** Renders a supplied set of entries with the requested total duration. */
    private String render(List<TestReportEntry> reportEntries, long totalDuration) {
        StringBuilder html = new StringBuilder();
        html.append("<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\">")
                .append("<title>Alya API Test Report</title><style>")
                .append("body{font-family:Arial,sans-serif;margin:32px;color:#202124}h1{margin-bottom:8px}")
                .append("table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #d9d9d9;padding:10px;text-align:left;vertical-align:top}th{background:#f1f3f4}.PASSED{color:#188038}.FAILED{color:#d93025}.SKIPPED,.ABORTED{color:#b06000}pre{white-space:pre-wrap;word-break:break-word;margin:0;max-height:260px;overflow:auto}")
                .append("</style></head><body><h1>Alya API Test Report</h1>")
                .append("<p>Generated at: ").append(REPORT_TIMESTAMP_FORMAT.format(Instant.now())).append("</p>")
                .append("<p>Total tests: ").append(reportEntries.size())
                .append(" | Total duration: ").append(totalDuration).append(" ms</p>")
                .append("<table><thead><tr><th>Test</th><th>Status</th><th>Duration</th><th>REST method</th><th>Endpoint</th><th>HTTP status</th><th>Response body</th><th>Details</th></tr></thead><tbody>");

        for (TestReportEntry entry : reportEntries) {
            html.append("<tr><td>").append(escape(entry.testName()))
                    .append("</td><td class=\"").append(entry.status()).append("\">").append(entry.status())
                    .append("</td><td>").append(entry.durationMs()).append(" ms</td><td>").append(escape(entry.method()))
                    .append("</td><td>").append(escape(entry.endpoint()))
                    .append("</td><td>").append(entry.statusCode() == 0 ? "N/A" : entry.statusCode())
                    .append("</td><td><pre>").append(escape(entry.responseBody()))
                    .append("</pre></td><td>").append(escape(entry.description()))
                    .append("<br>").append(escape(entry.details())).append("</td></tr>");
        }
        return html.append("</tbody></table></body></html>").toString();
    }

    /** Escapes dynamic values before placing them in the HTML report. */
    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private record TestReportEntry(
            String testName,
            String status,
            long durationMs,
            String method,
            String endpoint,
            String description,
            int statusCode,
            String responseBody,
            String details) {
    }
}
