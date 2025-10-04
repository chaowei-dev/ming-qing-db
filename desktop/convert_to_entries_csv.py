from __future__ import annotations

import argparse
import csv
from pathlib import Path
from typing import Dict, List


OUTPUT_HEADERS: List[str] = ["書名", "作者", "卷次", "卷名", "篇名", "版本", "備註"]
INPUT_FIELDS_REQUIRED: List[str] = [
    "title",
    "author",
    "version",
    "roll",
    "rollName",
    "entry",
]
INPUT_FIELDS_OPTIONAL: List[str] = ["bookNum", "rollNum", "entryNum"]


def derive_roll_text(row: Dict[str, str]) -> str:
    """Return 卷次 from the source row using only the "roll" field.

    If "roll" is blank or missing, return an empty string. Do not derive
    from other fields such as rollNum.
    """
    roll_text = (row.get("roll") or "").strip()
    if roll_text:
        return roll_text
    return ""


def convert_csv(input_path: Path, output_path: Path) -> None:
    with input_path.open("r", encoding="utf-8-sig", newline="") as fin, output_path.open(
        "w", encoding="utf-8", newline=""
    ) as fout:
        reader = csv.DictReader(fin)

        # Normalize incoming fieldnames (strip BOM/whitespace)
        fieldname_map: Dict[str, str] = {}
        if reader.fieldnames is None:
            raise ValueError("輸入 CSV 沒有標題列 (header)。")
        for name in reader.fieldnames:
            clean = (name or "").replace("\ufeff", "").strip()
            fieldname_map[clean] = name

        # Validate required fields
        missing = [f for f in INPUT_FIELDS_REQUIRED if f not in fieldname_map]
        if missing:
            raise ValueError(
                "輸入 CSV 缺少必要欄位: " + ", ".join(missing) + "\n"
                + "實際欄位為: " + ", ".join(sorted(fieldname_map.keys()))
            )

        writer = csv.writer(fout)
        writer.writerow(OUTPUT_HEADERS)

        for row in reader:
            # Access values via original names preserved in fieldname_map to avoid BOM/whitespace issues
            def get(field: str) -> str:
                original = fieldname_map.get(field)
                value = row.get(original, "") if original is not None else ""
                return value.strip() if isinstance(value, str) else value

            title = get("title")
            author = get("author")
            version = get("version")
            roll_text = derive_roll_text({k: get(k) for k in ("roll",)})
            roll_name = get("rollName")
            entry_name = get("entry")
            remarks = ""  # default empty

            # Skip completely empty lines
            if not any([title, author, version, roll_text, roll_name, entry_name]):
                continue

            writer.writerow([
                title,
                author,
                roll_text,
                roll_name,
                entry_name,
                version,
                remarks,
            ])


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "將輸入 CSV (bookNum,title,author,version,rollNum,roll,rollName,entryNum,entry) 轉為 "
            + ",".join(OUTPUT_HEADERS)
        )
    )
    parser.add_argument("input", type=Path, help="輸入 CSV 路徑")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="輸出 CSV 路徑；未指定則為同名加 _converted.csv",
    )
    args = parser.parse_args()

    input_path: Path = args.input.resolve()
    if not input_path.exists():
        raise SystemExit(f"找不到輸入檔案: {input_path}")

    output_path: Path
    if args.output is not None:
        output_path = args.output.resolve()
    else:
        output_path = input_path.with_name(input_path.stem + "_converted.csv")

    convert_csv(input_path, output_path)
    print(f"已完成：{output_path}")


if __name__ == "__main__":
    main()


