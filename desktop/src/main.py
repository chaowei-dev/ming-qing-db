from __future__ import annotations

from pathlib import Path
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from views.main_window import MainWindow
from utils.bootstrap import initialize_database_if_needed
from utils.paths import get_resource_path


def _load_qss_if_exists(app: QApplication) -> None:
    qss_path = get_resource_path("styles", "main.qss")
    if qss_path.is_file():
        try:
            app.setStyleSheet(qss_path.read_text(encoding="utf-8"))
        except Exception:
            # Silently ignore style loading errors at bootstrap stage
            pass


def main() -> None:
    app = QApplication([])
    
    # 強制禁用深色模式適配，始終使用淺色模式
    app.setStyle('Fusion')  # 使用 Fusion 樣式，跨平台一致性更好

    # 設置調色板為淺色模式
    from PyQt6.QtGui import QPalette, QColor
    palette = QPalette()
    
    # 設置基本顏色為淺色
    palette.setColor(QPalette.ColorRole.Window, QColor(240, 240, 240))
    palette.setColor(QPalette.ColorRole.WindowText, QColor(0, 0, 0))
    palette.setColor(QPalette.ColorRole.Base, QColor(255, 255, 255))
    palette.setColor(QPalette.ColorRole.AlternateBase, QColor(245, 245, 245))
    palette.setColor(QPalette.ColorRole.ToolTipBase, QColor(255, 255, 220))
    palette.setColor(QPalette.ColorRole.ToolTipText, QColor(0, 0, 0))
    palette.setColor(QPalette.ColorRole.Text, QColor(0, 0, 0))
    palette.setColor(QPalette.ColorRole.Button, QColor(240, 240, 240))
    palette.setColor(QPalette.ColorRole.ButtonText, QColor(0, 0, 0))
    palette.setColor(QPalette.ColorRole.BrightText, QColor(255, 0, 0))
    palette.setColor(QPalette.ColorRole.Link, QColor(0, 0, 255))
    palette.setColor(QPalette.ColorRole.Highlight, QColor(0, 120, 215))
    palette.setColor(QPalette.ColorRole.HighlightedText, QColor(255, 255, 255))
    
    app.setPalette(palette)
    
    _load_qss_if_exists(app)

    initialize_database_if_needed()

    window = MainWindow()
    window.show()

    app.exec()


if __name__ == "__main__":
    main()
