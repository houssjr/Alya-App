package com.alya.api;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.Launcher;
import org.junit.platform.launcher.LauncherDiscoveryRequest;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.junit.platform.launcher.listeners.SummaryGeneratingListener;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AlyaApiTest {
    private static Instant suiteStart;

    @BeforeAll
    /** Starts the timer used to measure the complete endpoint suite. */
    static void beforeSuite() {
        suiteStart = ApiTestSuiteBeforeAll.start();
    }

    @AfterAll
    /** Writes the aggregate report after all endpoint tests finish. */
    static void afterSuite() throws Exception {
        ApiTestSuiteAfterAll.writeReport(suiteStart);
    }

    @Test
    /** Launches every endpoint test and fails the suite when any child test fails. */
    void shouldRunAllEndpointTests() {
        SummaryGeneratingListener listener = new SummaryGeneratingListener();
        LauncherDiscoveryRequest request = LauncherDiscoveryRequestBuilder.request()
            .selectors(
                DiscoverySelectors.selectClass(LoginApiTest.class),
                DiscoverySelectors.selectClass(SessionApiTest.class),
                DiscoverySelectors.selectClass(FormSubmissionApiTest.class),
                DiscoverySelectors.selectClass(LatestSubmissionApiTest.class))
                .build();

        Launcher launcher = LauncherFactory.create();
        launcher.registerTestExecutionListeners(listener);
        launcher.execute(request);

        assertEquals(4, listener.getSummary().getTestsFoundCount());
        assertEquals(4, listener.getSummary().getTestsSucceededCount());
        assertEquals(0, listener.getSummary().getTestsFailedCount());
    }
}
