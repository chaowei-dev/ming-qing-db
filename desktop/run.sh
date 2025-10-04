#!/usr/bin/env bash
set -euo pipefail

# Resolve repository paths
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
VENV_DIR="${SCRIPT_DIR}/.venv"
PYTHON_BIN="${VENV_DIR}/bin/python"
REQ_FILE="${SCRIPT_DIR}/requirements.txt"
MAIN_FILE="${SCRIPT_DIR}/src/main.py"

# Create venv if missing and install deps
if [[ ! -x "${PYTHON_BIN}" ]]; then
  python3.12 -m venv "${VENV_DIR}"
  "${PYTHON_BIN}" -m pip install --upgrade pip
  "${PYTHON_BIN}" -m pip install --no-cache-dir -r "${REQ_FILE}"
fi

# Run with sanitized environment so PyQt6 uses its bundled Qt6
exec env -u QT_PLUGIN_PATH -u LD_LIBRARY_PATH "${PYTHON_BIN}" "${MAIN_FILE}"
