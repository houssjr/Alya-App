param(
    [ValidateSet("headless", "headed")]
    [string]$Mode = "headless",
    [ValidateSet("chrome", "edge")]
    [string]$Browser = "chrome",
    [string]$ReportDirectory = "reports",
    [switch]$Visible,
    [switch]$Parallel
)

Set-Location -LiteralPath $PSScriptRoot

$pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
$fallback = Join-Path $env:LOCALAPPDATA "Programs\Python\Python314\python.exe"
if (Test-Path $fallback) {
    $pythonPath = $fallback
} elseif ($pythonCommand) {
    $pythonPath = $pythonCommand.Source
} else {
    throw "Python was not found. Install Python or add it to PATH."
}

$scriptsDirectory = Join-Path (Split-Path $pythonPath -Parent) "Scripts"
$robot = Join-Path $scriptsDirectory "robot.exe"
$pabot = Join-Path $scriptsDirectory "pabot.exe"
$env:HEADLESS = if ($Visible -or $Mode -eq "headed") { "false" } else { "true" }
$env:BROWSER = "chromium"
$env:BROWSER_CHANNEL = if ($Browser -eq "edge") { "msedge" } else { "chrome" }
$env:REPORT_DIR = $ReportDirectory

if ($Parallel) {
    & $pabot --command $robot --end-command --outputdir $ReportDirectory --processes 2 tests
} else {
    & $robot --outputdir $ReportDirectory execution\ExecutionSuite.robot
}
