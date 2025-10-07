Param(
  [switch]$UseSystemPython
)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $ScriptDir '.venv'
$Py = Join-Path $VenvDir 'Scripts/python.exe'
$Pip = Join-Path $VenvDir 'Scripts/pip.exe'

if (-not $UseSystemPython) {
  if (-not (Test-Path $Py)) {
    py -3 -m venv $VenvDir
    & $Pip install --upgrade pip
  }
} else {
  $Py = 'python'
  $Pip = 'pip'
}

& $Pip install --no-cache-dir -r (Join-Path $ScriptDir 'requirements.txt')
& $Pip install --no-cache-dir pyinstaller -U appdirs

Push-Location $ScriptDir
& $Py -m PyInstaller --clean --noconfirm build_app.spec
Pop-Location

Write-Host "Built app under $ScriptDir/dist/MingQingDB"

