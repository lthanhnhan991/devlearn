#!/usr/bin/env bash
# Đồng bộ kiểu dùng chung:  backend/src/types/  ──►  frontend/src/types/
#
# ĐẶT FILE NÀY Ở THƯ MỤC GỐC REPO (cạnh backend/ và frontend/):
#     cp docs/kb/tools/sync-types.sh ./sync-types.sh
#
# Dùng:
#     ./sync-types.sh            copy backend -> frontend (xóa bản cũ rồi copy lại)
#     ./sync-types.sh --check    chỉ kiểm tra, KHÔNG copy; thoát mã 1 nếu lệch
#
# Không chạy được ./sync-types.sh?  Dùng:  bash sync-types.sh   (Windows: mở Git Bash)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/backend/src/types"
DST="$ROOT/frontend/src/types"
MARK="_SYNCED_FROM_BACKEND.txt"

if [ ! -d "$SRC" ]; then
  echo "❌ Không thấy $SRC"
  echo "   Hãy đặt sync-types.sh ở thư mục gốc devlearn/ (cạnh backend/ và frontend/)."
  exit 1
fi

if [ "${1:-}" = "--check" ]; then
  if [ ! -d "$DST" ]; then
    echo "❌ frontend/src/types chưa tồn tại. Chạy: ./sync-types.sh"
    exit 1
  fi
  if diff -r -x "$MARK" "$SRC" "$DST" > /dev/null; then
    echo "✅ frontend/src/types khớp backend/src/types"
    exit 0
  fi
  echo "❌ frontend/src/types LỆCH so với backend/src/types:"
  diff -rq -x "$MARK" "$SRC" "$DST" || true
  echo "   Chạy ./sync-types.sh rồi commit cả hai thư mục."
  exit 1
fi

rm -rf "$DST"
mkdir -p "$DST"
cp -R "$SRC"/. "$DST"/
printf 'FILE NÀY LÀ BẢN COPY - KHÔNG SỬA TRỰC TIẾP.\nNguồn: backend/src/types/ (chạy ./sync-types.sh để cập nhật).\nĐồng bộ lúc: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" > "$DST/$MARK"
echo "✅ Đã copy backend/src/types -> frontend/src/types"
