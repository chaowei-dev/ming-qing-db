#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
VENV_DIR="${SCRIPT_DIR}/.venv"
PYTHON_BIN="${VENV_DIR}/bin/python"
PIP_BIN="${VENV_DIR}/bin/pip"

if [[ ! -x "${PYTHON_BIN}" ]]; then
  python3 -m venv "${VENV_DIR}"
  "${PIP_BIN}" install --upgrade pip
fi

"${PIP_BIN}" install --no-cache-dir -r "${SCRIPT_DIR}/requirements.txt"
"${PIP_BIN}" install --no-cache-dir pyinstaller==6.* appdirs==1.4.*

pushd "${SCRIPT_DIR}" >/dev/null
"${VENV_DIR}/bin/pyinstaller" --clean --noconfirm build_app.spec
popd >/dev/null

echo "Built app under ${SCRIPT_DIR}/dist/MingQingDB"

