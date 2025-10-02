from __future__ import annotations

from pathlib import Path
from PyQt6.QtWidgets import QApplication
from views.main_window import MainWindow
from utils.bootstrap import initialize_database_if_needed


def _load_qss_if_exists(app: QApplication) -> None:
    root_dir = Path(__file__).resolve().parent.parent
    qss_path = root_dir / "resources" / "styles" / "main.qss"
    if qss_path.is_file():
        try:
            app.setStyleSheet(qss_path.read_text(encoding="utf-8"))
        except Exception:
            # Silently ignore style loading errors at bootstrap stage
            pass


def main() -> None:
    app = QApplication([])
    _load_qss_if_exists(app)

    initialize_database_if_needed()

    window = MainWindow()
    window.show()

    app.exec()


if __name__ == "__main__":
    main()
