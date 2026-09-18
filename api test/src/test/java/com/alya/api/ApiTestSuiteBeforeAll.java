package com.alya.api;

import java.time.Instant;

final class ApiTestSuiteBeforeAll {
    private ApiTestSuiteBeforeAll() {
    }

    /** Captures the start time before the aggregate suite executes. */
    static Instant start() {
        return Instant.now();
    }
}
