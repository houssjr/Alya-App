import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from robot.libraries.BuiltIn import BuiltIn


class Execution:
    """Robot Framework library that owns suite-level execution setup and teardown."""

    ROBOT_LIBRARY_SCOPE = "GLOBAL"

    def before_class(self, browser="chrome", mode="headless", report_directory="reports"):
        """Configure the selected browser and execution mode before the suite starts."""
        browser_channel = self._browser_channel(browser)
        headless = self._headless_value(mode)
        report_path = Path(report_directory)
        report_path.mkdir(parents=True, exist_ok=True)

        BuiltIn().set_global_variable("${BROWSER}", "chromium")
        BuiltIn().set_global_variable("${BROWSER_CHANNEL}", browser_channel)
        BuiltIn().set_global_variable("${HEADLESS}", headless)
        robot_report_path = self._robot_path(report_path)
        BuiltIn().set_global_variable("${REPORT_DIR}", robot_report_path)

        os.environ["BROWSER"] = "chromium"
        os.environ["BROWSER_CHANNEL"] = browser_channel
        os.environ["HEADLESS"] = str(headless).lower()
        os.environ["REPORT_DIR"] = robot_report_path

        self._write_execution_metadata(report_path, browser, mode, browser_channel, headless)
        BuiltIn().log(
            f"Execution setup: browser={browser}, channel={browser_channel}, "
            f"mode={'headless' if headless else 'headed'}, reports={report_path}",
            level="INFO",
        )

    def after_class(self, report_directory="reports"):
        """Close any open browser and record suite teardown completion."""
        try:
            BuiltIn().run_keyword("Close Browser")
        except Exception as error:
            BuiltIn().log(f"Browser teardown skipped: {error}", level="DEBUG")

        report_path = Path(report_directory)
        report_path.mkdir(parents=True, exist_ok=True)
        teardown_file = report_path / "execution-teardown.txt"
        teardown_file.write_text(
            f"Suite teardown completed at {self._timestamp()}\n",
            encoding="utf-8",
        )
        BuiltIn().log(
            "Suite teardown completed. Robot Framework generates report.html, log.html, and output.xml.",
            level="INFO",
        )

    def run_configured_tests(self, *suite_paths, child_report_directory=""):
        """Run the configured Robot suites and fail the execution suite on child failure."""
        project_root = Path(__file__).resolve().parents[1]
        child_report_path = Path(child_report_directory or os.getenv("REPORT_DIR", "reports"))
        if not child_report_path.is_absolute():
            child_report_path = project_root / child_report_path
        child_report_path.mkdir(parents=True, exist_ok=True)

        command = [
            sys.executable,
            "-m",
            "robot",
            "--outputdir",
            str(child_report_path),
            "--variable",
            f"BROWSER_CHANNEL:{os.getenv('BROWSER_CHANNEL', 'chrome')}",
            "--variable",
            f"HEADLESS:{os.getenv('HEADLESS', 'true')}",
            "--variable",
            f"REPORT_DIR:{self._robot_path(child_report_path)}",
            *suite_paths,
        ]
        result = subprocess.run(command, cwd=project_root, check=False)
        if result.returncode != 0:
            raise AssertionError(f"Configured Robot suites failed with exit code {result.returncode}.")

    @staticmethod
    def _robot_path(path):
        """Convert a Windows path to a Robot-safe forward-slash path."""
        return str(path).replace("\\", "/")

    @staticmethod
    def _browser_channel(browser):
        channels = {"chrome": "chrome", "edge": "msedge", "msedge": "msedge"}
        normalized = str(browser).strip().lower()
        if normalized not in channels:
            raise ValueError("Browser must be 'chrome' or 'edge'.")
        return channels[normalized]

    @staticmethod
    def _headless_value(mode):
        normalized = str(mode).strip().lower()
        if normalized not in {"headless", "headed"}:
            raise ValueError("Mode must be 'headless' or 'headed'.")
        return normalized == "headless"

    @staticmethod
    def _timestamp():
        return datetime.now(timezone.utc).isoformat()

    def _write_execution_metadata(self, report_path, browser, mode, channel, headless):
        metadata = {
            "started_at": self._timestamp(),
            "browser": browser,
            "playwright_channel": channel,
            "mode": mode,
            "headless": headless,
        }
        (report_path / "execution-config.json").write_text(
            json.dumps(metadata, indent=2),
            encoding="utf-8",
        )
