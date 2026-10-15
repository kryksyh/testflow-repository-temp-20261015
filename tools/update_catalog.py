#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# MuseScore-CLA-applies
# Copyright (C) 2026 MuseScore Limited and others

"""Create the public TestFlow catalog without executing test scripts."""

import argparse
import hashlib
import json
import re
from pathlib import Path


MAX_FILE_SIZE = 2 * 1024 * 1024
MAX_BUNDLE_SIZE = 16 * 1024 * 1024
MAX_FILES = 128
COMPONENT = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\Z")
IDENTIFIER = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,79}\Z")


def blob_hash(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def content_revision(files):
    data = b"main.js\n" + b"".join(
        name.encode("ascii") + b"\0" + sha.encode("ascii") + b"\n"
        for name, sha in sorted(files.items())
    )
    return hashlib.sha256(data).hexdigest()


def make_catalog(root):
    cases = []
    case_root = root / "cases"
    if case_root.is_symlink() or not case_root.is_dir():
        raise ValueError("The repository must contain a cases directory.")
    for case in sorted(case_root.iterdir()):
        if case.is_symlink() or not case.is_dir() or not IDENTIFIER.fullmatch(case.name):
            raise ValueError(f"Unsupported case directory: {case}")
        metadata_path = case / "metadata.json"
        if metadata_path.is_symlink() or metadata_path.stat().st_size > MAX_FILE_SIZE:
            raise ValueError(f"Unsupported metadata file: {metadata_path}")
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        review = metadata.get("review", {})
        if (metadata.get("schemaVersion") != 1 or metadata.get("id") != case.name
                or not isinstance(metadata.get("title"), str) or not metadata["title"].strip()
                or not re.fullmatch(r"https://github\.com/[^/]+/[^/]+/issues/[0-9]+", metadata.get("issueUrl", ""))
                or not isinstance(metadata.get("tags"), list)
                or not all(isinstance(tag, str) for tag in metadata["tags"])
                or not isinstance(metadata.get("reproductions"), list)
                or review.get("state") not in ("unverified", "verified", "rejected")
                or (review.get("state") == "rejected" and not review.get("reason", "").strip())):
            raise ValueError(f"Invalid metadata: {metadata_path}")
        if review["state"] != "unverified":
            if (not re.fullmatch(r"[0-9a-f]{64}", review.get("revision", ""))
                    or not review.get("reviewer") or not review.get("reviewedAt")):
                raise ValueError(f"The review must identify the person, date, and revision: {metadata_path}")
        files = {}
        total = 0
        for path in sorted(case.rglob("*")):
            name = path.relative_to(case).as_posix()
            if path.is_symlink() or not all(COMPONENT.fullmatch(part) for part in name.split("/")):
                raise ValueError(f"Unsupported path: {path}")
            if path.is_dir() or name == "metadata.json":
                continue
            if not path.is_file() or path.stat().st_size > MAX_FILE_SIZE:
                raise ValueError(f"Unsupported file or file size: {path}")
            data = path.read_bytes()
            total += len(data)
            files[name] = blob_hash(data)
        if "main.js" not in files or len(files) > MAX_FILES or total > MAX_BUNDLE_SIZE:
            raise ValueError(f"Missing main.js, or the case exceeds the size limits: {case}")
        cases.append({
            "id": case.name,
            "metadata": metadata,
            "metadataSha": blob_hash(metadata_path.read_bytes()),
            "files": files,
            "revision": content_revision(files),
        })
    return {"schemaVersion": 1, "cases": cases}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", type=Path)
    parser.add_argument("--check", action="store_true", help="Report a stale catalog without changing files.")
    args = parser.parse_args()
    try:
        root = args.repository.resolve(strict=True)
        catalog = make_catalog(root)
        destination = root / "catalog.json"
        if args.check:
            if not destination.is_file() or json.loads(destination.read_text(encoding="utf-8")) != catalog:
                parser.exit(1, "catalog.json is stale. Run update_catalog.py without --check.\n")
        else:
            destination.write_text(json.dumps(catalog, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")
    except (OSError, ValueError, TypeError, AttributeError) as error:
        parser.exit(1, f"Cannot create the catalog: {error}\n")


if __name__ == "__main__":
    main()
