package com.alya.api;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class TestProperties {
    private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

    final Properties data = load("data.properties");
    final Properties urls = load("url.properties");
    final Properties bodies = load("body.properties");
    final Properties expected = load("expected-response.properties");

    /** Reads a property, resolves placeholders, and fails fast when it is missing. */
    String value(Properties properties, String key) {
        String rawValue = properties.getProperty(key);
        if (rawValue == null || rawValue.isBlank()) {
            throw new IllegalStateException("Missing required property: " + key);
        }
        return resolve(rawValue);
    }

    /** Returns a resolved JSON request body template. */
    String body(String key) {
        return resolve(value(bodies, key));
    }

    /** Returns an expected numeric value from the response properties. */
    int integer(String key) {
        return Integer.parseInt(value(expected, key));
    }

    /** Returns an expected boolean value from the response properties. */
    boolean booleanValue(String key) {
        return Boolean.parseBoolean(value(expected, key));
    }

    /** Combines the configured base URL with an endpoint path. */
    String endpoint(String key) {
        return value(urls, "base.url") + value(urls, key);
    }

    /** Replaces data and expected-value placeholders in a property value. */
    private String resolve(String template) {
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String replacement = data.getProperty(matcher.group(1));
            if (replacement == null) {
                replacement = expected.getProperty(matcher.group(1));
            }
            if (replacement == null) {
                throw new IllegalStateException("Missing property referenced by template: " + matcher.group(1));
            }
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    /** Loads a UTF-8 properties resource from the test classpath. */
    private static Properties load(String resourceName) {
        Properties properties = new Properties();
        try (InputStream stream = TestProperties.class.getClassLoader().getResourceAsStream(resourceName)) {
            if (stream == null) {
                throw new IllegalStateException("Missing test resource: " + resourceName);
            }
            properties.load(new InputStreamReader(stream, StandardCharsets.UTF_8));
            return properties;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load test resource: " + resourceName, exception);
        }
    }
}
