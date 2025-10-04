from __future__ import annotations

from typing import Optional

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton


class ImportView(QWidget):
    def __init__(self, parent: Optional[QWidget] = None) -> None:
        super().__init__(parent)

        self._import_btn = QPushButton("匯入", self)
        self._import_btn.setEnabled(True)
        self._import_btn.setFixedWidth(160)
        self._import_btn.setFixedHeight(40)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 64, 24, 24)
        layout.setSpacing(16)
        layout.addStretch(1)
        layout.addWidget(self._import_btn, alignment=Qt.AlignmentFlag.AlignHCenter)
        layout.addStretch(2)


