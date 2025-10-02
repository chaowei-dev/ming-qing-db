from PyQt6.QtWidgets import QMainWindow, QTabWidget, QWidget, QVBoxLayout, QLabel


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("明清文獻資料庫（桌面版）")
        self.resize(1000, 700)

        self.tab_widget = QTabWidget(self)
        self.setCentralWidget(self.tab_widget)

        self._init_tabs()

    def _init_tabs(self) -> None:
        # 書籍
        books_tab = QWidget(self)
        books_layout = QVBoxLayout(books_tab)
        books_layout.addWidget(QLabel("書籍管理（待實作）", books_tab))
        self.tab_widget.addTab(books_tab, "書籍")

        # 篇目
        entries_tab = QWidget(self)
        entries_layout = QVBoxLayout(entries_tab)
        entries_layout.addWidget(QLabel("篇目管理（待實作）", entries_tab))
        self.tab_widget.addTab(entries_tab, "篇目")

        # 搜尋
        search_tab = QWidget(self)
        search_layout = QVBoxLayout(search_tab)
        search_layout.addWidget(QLabel("搜尋（待實作）", search_tab))
        self.tab_widget.addTab(search_tab, "搜尋")
