#!/usr/bin/env python3
"""Mirror docs/manuals and docs/vendor_docs into public/docs for static serving.
Run this from the project root when the app is served with public/ as the web root.
"""
from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
PAIRS = [
    (ROOT / "docs" / "manuals", ROOT / "public" / "docs" / "manuals"),
    (ROOT / "docs" / "vendor_docs", ROOT / "public" / "docs" / "vendor_docs"),
]

for src, dst in PAIRS:
    if not src.exists():
        print(f"[SKIP] source not found: {src}")
        continue
    if dst.exists():
        shutil.rmtree(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, dst)
    count = sum(1 for p in dst.rglob("*") if p.is_file())
    print(f"[OK] {src.relative_to(ROOT)} -> {dst.relative_to(ROOT)} ({count} files)")

print("[DONE] docs assets are now available under public/docs/.")
