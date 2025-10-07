from PyQt6.QtWidgets import QMainWindow, QTabWidget, QWidget, QVBoxLayout, QLabel
from .search_entries_view import SearchView
from .search_books_view import SearchBookView
from .category_view import CategoryView
from .backup_view import BackupView


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("明清文獻資料庫（桌面版）")
        self.resize(1440, 900)

        self.tab_widget = QTabWidget(self)
        self.setCentralWidget(self.tab_widget)

        self._init_tabs()

    def _init_tabs(self) -> None:
        # 搜尋篇目
        search_entries_tab = QWidget(self)
        search_entries_layout = QVBoxLayout(search_entries_tab)
        search_entries_layout.addWidget(SearchView(search_entries_tab))
        self.tab_widget.addTab(search_entries_tab, "搜尋篇目")

        # 搜尋書籍
        search_books_tab = QWidget(self)
        search_books_layout = QVBoxLayout(search_books_tab)
        search_books_layout.addWidget(SearchBookView(search_books_tab))
        self.tab_widget.addTab(search_books_tab, "搜尋書籍")

        # 類別
        categories_tab = QWidget(self)
        categories_layout = QVBoxLayout(categories_tab)
        categories_layout.addWidget(CategoryView(categories_tab))
        self.tab_widget.addTab(categories_tab, "類別")


        # 備份（備份按鈕，資料庫版本切換／匯出.csv）
        backup_tab = QWidget(self)
        backup_layout = QVBoxLayout(backup_tab)
        backup_layout.addWidget(BackupView(backup_tab))
        self.tab_widget.addTab(backup_tab, "資料庫管理")