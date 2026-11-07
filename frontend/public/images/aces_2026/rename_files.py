"""Rename files in a directory using a numbered naming pattern.

Example:
    python rename_files.py --prefix aces

The files are renamed to names such as ``aces_1.jpeg``, ``aces_2.jpeg``,
and so on. File extensions are preserved.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from uuid import uuid4


def rename_files(directory: Path, prefix: str, dry_run: bool = False) -> None:
    """Rename regular files in *directory* to ``prefix_number.extension``."""
    script_path = Path(__file__).resolve()
    files = sorted(
        (
            path
            for path in directory.iterdir()
            if path.is_file() and path.resolve() != script_path
        ),
        key=lambda path: path.name.casefold(),
    )

    if not files:
        print("No files found.")
        return

    renames = [
        (source, directory / f"{prefix}_{number}{source.suffix}")
        for number, source in enumerate(files, start=1)
    ]

    if dry_run:
        for source, destination in renames:
            print(f"{source.name} -> {destination.name}")
        return

    # Use temporary names first so existing destination names cannot collide.
    temporary_paths = [
        source.with_name(f".rename-temp-{uuid4().hex}{source.suffix}")
        for source, _ in renames
    ]

    try:
        for (source, _), temporary in zip(renames, temporary_paths):
            source.rename(temporary)

        for temporary, (_, destination) in zip(temporary_paths, renames):
            temporary.rename(destination)
            print(f"{temporary.name} -> {destination.name}")
    except Exception:
        for temporary in temporary_paths:
            if temporary.exists():
                temporary.rename(
                    next(source for source, temp in zip(files, temporary_paths) if temp == temporary)
                )
        raise


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Rename all regular files in a directory with numbered names."
    )
    parser.add_argument(
        "--directory",
        type=Path,
        default=Path.cwd(),
        help="Directory containing the files (default: current directory).",
    )
    parser.add_argument(
        "--prefix",
        default="aces",
        help="Filename prefix (default: aces).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show the planned renames without changing files.",
    )
    args = parser.parse_args()

    rename_files(args.directory.resolve(), args.prefix, args.dry_run)


if __name__ == "__main__":
    main()
