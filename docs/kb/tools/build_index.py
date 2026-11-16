#!/usr/bin/env python3
"""Sinh lại khối BẢN ĐỒ TỆP trong 00_INDEX.md (giữa <!-- AUTO:START --> và <!-- AUTO:END -->).
Chạy sau khi thêm/xóa/đổi tên file KB:  python docs/kb/tools/build_index.py
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "00_INDEX" / "00_INDEX.md"
TITLES = {
    "00_INDEX": "Bản đồ & đọc trước",
    "01_CONCEPTS": "Khái niệm nghiệp vụ",
    "02_ARCHITECTURE": "Kiến trúc · CSDL · API · UI",
    "03_DECISIONS": "Quyết định kỹ thuật (ADR)",
    "04_RULES_WORKFLOWS": "Luật & quy trình",
    "05_MEMORY_LOGS": "Bộ nhớ làm việc",
    "06_EXECUTION_PLAN": "Kế hoạch thực thi",
}


def title_of(path: Path) -> str:
    m = re.search(r"^title:\s*(.+)$", path.read_text(encoding="utf-8"), re.M)
    return m.group(1).strip() if m else path.stem


def build() -> str:
    lines: list[str] = []
    for d in sorted(p for p in ROOT.iterdir() if p.is_dir() and re.match(r"\d\d_", p.name)):
        lines.append(f"### `{d.name}/` — {TITLES.get(d.name, '')}")
        for f in sorted(d.glob("*.md")):
            if f.stem == "00_INDEX":
                continue
            lines.append(f"- [[{f.stem}]] — {title_of(f)}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")
    new = re.sub(r"(<!-- AUTO:START -->\n).*?(<!-- AUTO:END -->)", lambda m: m.group(1) + build() + m.group(2), text, flags=re.S)
    INDEX.write_text(new, encoding="utf-8")
    print("✅ Đã cập nhật 00_INDEX.md")


if __name__ == "__main__":
    main()
