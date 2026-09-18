import os


def _boolean(name, default):
    return os.getenv(name, default).lower() in {"1", "true", "yes", "on"}


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5173")
API_URL = os.getenv("API_URL", "http://127.0.0.1:3001")
APP_USERNAME = os.getenv("APP_USERNAME", "admin")
APP_PASSWORD = os.getenv("APP_PASSWORD", "admin123")
BROWSER = os.getenv("BROWSER", "chromium")
BROWSER_CHANNEL = os.getenv("BROWSER_CHANNEL", "chrome")
HEADLESS = _boolean("HEADLESS", "true")
SLOW_MO = int(os.getenv("SLOW_MO", "0"))
