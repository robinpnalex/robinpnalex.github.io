from html import escape
from pathlib import Path
import re
import shutil

import markdown


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "_site"
EXCLUDED_DIRS = {".git", ".claude", "_site", "node_modules", ".npm-cache"}


def convert_markdown(source: Path, destination: Path) -> None:
    text = source.read_text(encoding="utf-8")
    content = markdown.markdown(text, extensions=["fenced_code"])

    # Generated pages use .html filenames, so update links to Markdown pages.
    content = re.sub(
        r'(?P<prefix>href=["\'])(?P<path>[^"\']+)\.md(?P<fragment>#[^"\']*)?(?P<quote>["\'])',
        lambda match: (
            match.group("prefix")
            + match.group("path")
            + ".html"
            + (match.group("fragment") or "")
            + match.group("quote")
        ),
        content,
    )

    title = escape(source.stem.replace("-", " ").title())
    page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    body {{ max-width: 760px; margin: 48px auto; padding: 0 24px; background: #171916; color: #eee; font-family: system-ui, sans-serif; line-height: 1.6; }}
    a {{ color: #ff896b; }}
    pre {{ overflow-x: auto; padding: 16px; background: #242721; color: #eee; border-radius: 6px; font: 14px/1.3 monospace; white-space: pre; }}
    img {{ max-width: 100%; height: auto; }}
  </style>
</head>
<body>
  <main>{content}</main>
</body>
</html>
"""

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(page, encoding="utf-8")


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)

    for source in ROOT.rglob("*"):
        relative = source.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in relative.parts):
            continue
        if source.is_dir():
            continue

        if source.suffix.lower() == ".md":
            destination = OUTPUT / relative.with_suffix(".html")
            convert_markdown(source, destination)
        elif source.name != "build.py" and source.name != "requirements.txt":
            # The Markdown homepage replaces the old hand-written homepage in the output.
            if relative == Path("index.html") and (ROOT / "index.md").exists():
                continue
            destination = OUTPUT / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    print(f"Built website in {OUTPUT}")


if __name__ == "__main__":
    main()
