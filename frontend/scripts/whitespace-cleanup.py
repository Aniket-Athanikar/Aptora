#!/usr/bin/env python3
"""Strip trailing whitespace, collapse 3+ blank lines, ensure single trailing newline."""
import os
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".html", ".json", ".md", ".yml", ".yaml", ".py"}
SKIP_DIRS = {"node_modules", ".next", ".git", "dist", "build", "__pycache__"}

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for name in filenames:
        p = Path(dirpath) / name
        if p.suffix.lower() not in EXTENSIONS:
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        original = text
        lines = text.splitlines()
        lines = [ln.rstrip() for ln in lines]
        text = "\n".join(lines)
        text = re.sub(r"\n{3,}", "\n\n", text)
        if not text.endswith("\n"):
            text += "\n"
        if text != original:
            p.write_text(text, encoding="utf-8")
            count += 1
print(f"Cleaned {count} files")
