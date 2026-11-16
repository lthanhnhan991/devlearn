#!/usr/bin/env python3
"""Kiểm tra Knowledge Base DevLearn.

Luật:
  1. Mỗi .md trong các thư mục NN_* có frontmatter đủ khóa bắt buộc.
  2. `id` == tên file (không .md) và duy nhất.
  3. Mọi liên kết [[id]] (thân bài + `related`) phải trỏ tới id tồn tại.
  4. Mỗi file ≤ 300 dòng.
  5. Mọi file (trừ 00_INDEX) phải được liên kết đến từ file khác và có mặt trong 00_INDEX.
Chạy (từ thư mục gốc repo):  python docs/kb/tools/kb_lint.py   (thoát mã 1 nếu có lỗi)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ("id", "title", "type", "status", "tags", "related", "updated")
MAX_LINES = 300
LINK_RE = re.compile(r"\[\[([^\]\s|#]+)(?:[|#][^\]]*)?\]\]")
FENCE_RE = re.compile(r"```.*?```", re.S)
INLINE_RE = re.compile(r"`[^`\n]*`")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str] | None:
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end == -1:
        return None
    meta: dict[str, str] = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return meta, text[end + 5 :]


def strip_code(body: str) -> str:
    return INLINE_RE.sub("", FENCE_RE.sub("", body))


def main() -> int:
    files = sorted(p for d in ROOT.iterdir() if d.is_dir() and re.match(r"\d\d_", d.name) for p in d.glob("*.md"))
    errors: list[str] = []
    ids: dict[str, Path] = {}
    inbound: dict[str, set[str]] = {}
    bodies: dict[str, str] = {}
    metas: dict[str, dict[str, str]] = {}

    for path in files:
        rel = path.relative_to(ROOT)
        text = path.read_text(encoding="utf-8")
        if text.count("\n") + 1 > MAX_LINES:
            errors.append(f"{rel}: {text.count(chr(10)) + 1} dòng (> {MAX_LINES}) — hãy tách ghi chú")
        parsed = parse_frontmatter(text)
        if parsed is None:
            errors.append(f"{rel}: thiếu frontmatter YAML")
            continue
        meta, body = parsed
        for key in REQUIRED:
            if key not in meta:
                errors.append(f"{rel}: thiếu khóa frontmatter `{key}`")
        fid = meta.get("id", "")
        if fid != path.stem:
            errors.append(f"{rel}: id `{fid}` ≠ tên file `{path.stem}`")
        if fid in ids:
            errors.append(f"{rel}: id trùng với {ids[fid].relative_to(ROOT)}")
        ids[fid] = path
        bodies[fid] = body
        metas[fid] = meta

    for fid, body in bodies.items():
        targets = set(LINK_RE.findall(strip_code(body)))
        related = metas[fid].get("related", "").strip("[]")
        targets |= {t.strip() for t in related.split(",") if t.strip()}
        for t in sorted(targets):
            if t not in ids:
                errors.append(f"{ids[fid].relative_to(ROOT)}: liên kết gãy [[{t}]]")
            elif t != fid:
                inbound.setdefault(t, set()).add(fid)

    index_body = bodies.get("00_INDEX", "")
    for fid, path in ids.items():
        if fid == "00_INDEX":
            continue
        if not inbound.get(fid):
            errors.append(f"{path.relative_to(ROOT)}: file mồ côi (không file nào liên kết tới)")
        if f"[[{fid}]]" not in index_body:
            errors.append(f"{path.relative_to(ROOT)}: chưa có trong 00_INDEX (chạy docs/kb/tools/build_index.py)")

    if errors:
        print(f"❌ {len(errors)} lỗi:")
        for e in errors:
            print("  -", e)
        return 1
    print(f"✅ KB hợp lệ: {len(ids)} ghi chú, 0 lỗi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
