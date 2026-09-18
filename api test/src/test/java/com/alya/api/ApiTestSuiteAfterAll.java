package com.alya.api;

import java.io.IOException;
import java.time.Instant;

final class ApiTestSuiteAfterAll {
    private ApiTestSuiteAfterAll() {
    }

    /** Delegates aggregate HTML report creation after suite execution. */
    static void writeReport(Instant suiteStart) throws IOException {
        ApiTestReportExtension.writeSuiteReport(suiteStart);
    }
}
