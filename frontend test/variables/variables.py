import os


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5173")
API_URL = os.getenv("API_URL", "http://127.0.0.1:3001")
APP_USERNAME = os.getenv("APP_USERNAME", "admin")
APP_PASSWORD = os.getenv("APP_PASSWORD", "admin123")
BROWSER = os.getenv("BROWSER", "chromium")
BROWSER_CHANNEL = os.getenv("BROWSER_CHANNEL", "chrome")
HEADLESS = os.getenv("HEADLESS", "true").lower() in {"1", "true", "yes", "on"}
EXECUTION_MODE = "headless" if HEADLESS else "headed"
SLOW_MO = int(os.getenv("SLOW_MO", "0"))
REPORT_DIR = os.getenv("REPORT_DIR", "reports")
BROWSER_ARGS = ["--start-maximized"]
TEST_SUITES = [
	suite.strip()
	for suite in os.getenv("TEST_SUITES", "tests/login.robot,tests/form_submission.robot").split(",")
	if suite.strip()
]
