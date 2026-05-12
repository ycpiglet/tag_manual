#!/usr/bin/env python3
"""Mirror docs/manuals and docs/vendor_docs into public/docs.

This version is safe to run from either the project root or the public/ folder.
It finds the project root by walking upward until it sees both:
  - docs/manuals
  - public/

Usage:
  python3 sync_docs_to_public_anywhere.py

Then serve the app, for example:
  cd public
  python3 -m http.server 8000
"""
from __future__ import annotations

from pathlib import Path
import shutil
import sys


def candidate_roots() -> list[Path]:
    starts = [Path.cwd().resolve(), Path(__file__).resolve().parent]
    roots: list[Path] = []
    for start in starts:
        for p in [start, *start.parents]:
            if p not in roots:
                roots.append(p)
    return roots


def find_project_root() -> Path:
    for root in candidate_roots():
        if (root / "docs" / "manuals").is_dir() and (root / "public").is_dir():
            return root
    checked = "\n".join(f"  - {p}" for p in candidate_roots())
    raise SystemExit(
        "[ERROR] Could not find project root.\n"
        "Expected a directory containing both docs/manuals and public/.\n"
        f"Checked:\n{checked}"
    )


def mirror(src: Path, dst: Path, root: Path) -> None:
    if not src.exists():
        print(f"[SKIP] source not found: {src.relative_to(root)}")
        return
    if dst.exists():
        shutil.rmtree(dst)
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src, dst)
    count = sum(1 for p in dst.rglob("*") if p.is_file())
    print(f"[OK] {src.relative_to(root)} -> {dst.relative_to(root)} ({count} files)")


def main() -> int:
    root = find_project_root()
    public = root / "public"
    print(f"[ROOT] {root}")

    pairs = [
        (root / "docs" / "manuals", public / "docs" / "manuals"),
        (root / "docs" / "vendor_docs", public / "docs" / "vendor_docs"),
    ]
    for src, dst in pairs:
        mirror(src, dst, root)

    (public / ".nojekyll").touch(exist_ok=True)
    print("[DONE] docs assets are now available under public/docs/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
