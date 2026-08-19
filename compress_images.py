"""Compress blog JPG/PNG images to WebP and update local Markdown references."""

from __future__ import annotations

import argparse
import os
import re
import sys
from collections import Counter
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:  # pragma: no cover - exercised when Pillow is unavailable
    print(
        "Pillow is required. Install it with: python -m pip install Pillow",
        file=sys.stderr,
    )
    raise SystemExit(1)


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_BLOG_ROOT = PROJECT_ROOT / "src" / "content" / "blog"
SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


@dataclass(frozen=True)
class Conversion:
    source: Path
    output: Path
    source_size: int
    output_size: int

    @property
    def saved_bytes(self) -> int:
        return self.source_size - self.output_size


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compress blog JPG/PNG images to smaller WebP files."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Image file or directory to process (default: src/content/blog)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="WebP quality from 1 to 100 (default: 82)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Regenerate WebP files that already exist",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would happen without writing files or Markdown",
    )
    parser.add_argument(
        "--no-update-refs",
        action="store_true",
        help="Create WebP files without updating Markdown references",
    )
    args = parser.parse_args()
    if not 1 <= args.quality <= 100:
        parser.error("--quality must be between 1 and 100")
    return args


def resolve_input_path(value: str) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = PROJECT_ROOT / path
    return path.resolve()


def collect_images(values: list[str]) -> list[Path]:
    roots = [resolve_input_path(value) for value in values] or [DEFAULT_BLOG_ROOT]
    images: set[Path] = set()

    for root in roots:
        if not root.exists():
            raise FileNotFoundError(f"Input path does not exist: {root}")
        if root.is_file():
            if root.suffix.lower() in SOURCE_EXTENSIONS:
                images.add(root)
            continue
        images.update(
            path
            for path in root.rglob("*")
            if path.is_file() and path.suffix.lower() in SOURCE_EXTENSIONS
        )

    return sorted(images, key=lambda path: path.as_posix().lower())


def encode_webp(source: Path, quality: int) -> bytes:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
        image = image.convert("RGBA" if has_alpha else "RGB")

        buffer = BytesIO()
        image.save(buffer, format="WEBP", quality=quality, method=6)
        return buffer.getvalue()


def convert_image(
    source: Path,
    quality: int,
    overwrite: bool,
    dry_run: bool,
) -> tuple[Conversion | None, str | None]:
    output = source.with_suffix(".webp")
    source_size = source.stat().st_size

    if output.exists() and not overwrite:
        return None, "already exists"

    encoded = encode_webp(source, quality)
    output_size = len(encoded)
    if output_size >= source_size:
        return None, "WebP is not smaller"

    conversion = Conversion(source, output, source_size, output_size)
    if not dry_run:
        output.write_bytes(encoded)
    return conversion, None


def is_inside(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def reference_pattern(reference: str) -> re.Pattern[str]:
    escaped = re.escape(reference)
    boundary = r"[A-Za-z0-9_/:.\-]"
    return re.compile(rf"(?<!{boundary}){escaped}(?![A-Za-z0-9_])")


def replace_local_reference(text: str, old: str, new: str) -> tuple[str, int]:
    replacements = 0
    for reference in (old, f"./{old}"):
        pattern = reference_pattern(reference)
        text, count = pattern.subn(new if reference == old else f"./{new}", text)
        replacements += count
    return text, replacements


def update_markdown_references(
    conversions: Iterable[Conversion],
    blog_root: Path,
    dry_run: bool,
) -> tuple[int, int]:
    conversions = [
        conversion
        for conversion in conversions
        if is_inside(conversion.source, blog_root)
    ]
    if not conversions:
        return 0, 0

    markdown_files = sorted(blog_root.rglob("*.md"))
    changed_files = 0
    replacement_count = 0

    for markdown_file in markdown_files:
        updated = markdown_file.read_text(encoding="utf-8")
        original = updated

        for conversion in conversions:
            old_reference = Path(
                os.path.relpath(conversion.source, markdown_file.parent)
            ).as_posix()
            new_reference = Path(
                os.path.relpath(conversion.output, markdown_file.parent)
            ).as_posix()
            updated, count = replace_local_reference(
                updated, old_reference, new_reference
            )
            replacement_count += count

        if updated != original:
            changed_files += 1
            if not dry_run:
                markdown_file.write_text(updated, encoding="utf-8")

    return changed_files, replacement_count


def format_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def main() -> int:
    args = parse_args()
    try:
        images = collect_images(args.paths)
    except FileNotFoundError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    conversions: list[Conversion] = []
    skipped = Counter()
    errors: list[tuple[Path, str]] = []

    for image in images:
        try:
            conversion, reason = convert_image(
                image,
                quality=args.quality,
                overwrite=args.overwrite,
                dry_run=args.dry_run,
            )
        except (OSError, UnidentifiedImageError) as error:
            errors.append((image, str(error)))
            skipped["error"] += 1
            continue

        if conversion is None:
            skipped[reason or "skipped"] += 1
        else:
            conversions.append(conversion)
            action = "Would convert" if args.dry_run else "Converted"
            print(
                f"{action}: {image} -> {conversion.output} "
                f"({format_size(conversion.source_size)} -> "
                f"{format_size(conversion.output_size)})"
            )

    changed_files = replacement_count = 0
    if not args.no_update_refs:
        changed_files, replacement_count = update_markdown_references(
            conversions,
            DEFAULT_BLOG_ROOT,
            dry_run=args.dry_run,
        )

    saved_bytes = sum(conversion.saved_bytes for conversion in conversions)
    print()
    print(f"Images scanned: {len(images)}")
    print(f"Images converted: {len(conversions)}")
    print(f"Images skipped: {sum(skipped.values())}")
    for reason, count in sorted(skipped.items()):
        print(f"  - {reason}: {count}")
    if errors:
        for image, error in errors:
            print(f"  - {image}: {error}")
    print(f"Markdown files updated: {changed_files}")
    print(f"Image references updated: {replacement_count}")
    print(f"Total space saved: {format_size(saved_bytes)}")
    if args.dry_run:
        print("Dry run: no files were changed")

    return 1 if errors and not conversions else 0


if __name__ == "__main__":
    raise SystemExit(main())
