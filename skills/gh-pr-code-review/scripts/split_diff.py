#!/usr/bin/env python3
"""
Split PR diff into batches for parallel code review.

Checks out to PR branch first, then uses local git commands to:
1. Find changed files via `git diff --name-only origin/{target}...HEAD`
2. Apply include/exclude filters
3. Get per-file diffs and split into size-limited batches

Usage:
    python3 split_diff.py \
        --target-branch main \
        --include "**/*.ts, **/*.tsx" \
        --exclude "**/node_modules/**, **/*.test.*" \
        --max-batch-size 102400 \
        --concurrency 5 \
        --output-dir .claude
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import PurePosixPath


def run_git_command(cmd: list[str]) -> str:
    """Run a git command and return stdout."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running: {' '.join(cmd)}", file=sys.stderr)
        print(f"stderr: {result.stderr}", file=sys.stderr)
        return ""
    return result.stdout


def get_changed_files(target_branch: str) -> list[str]:
    """Get list of all changed files between target branch and HEAD."""
    output = run_git_command(
        ["git", "diff", "--name-only", f"origin/{target_branch}...HEAD"]
    )
    return [line for line in output.strip().split("\n") if line]


def get_file_diff(target_branch: str, filepath: str) -> str:
    """Get the diff for a single file."""
    return run_git_command(
        ["git", "diff", f"origin/{target_branch}...HEAD", "--", filepath]
    )


def get_file_change_stats(target_branch: str, filepath: str) -> tuple[int, int]:
    """Get added and deleted line counts for a file."""
    output = run_git_command(
        ["git", "diff", "--numstat", f"origin/{target_branch}...HEAD", "--", filepath]
    )
    if not output.strip():
        return 0, 0
    parts = output.strip().split("\t")
    if len(parts) >= 2:
        try:
            added = int(parts[0]) if parts[0] != "-" else 0
            deleted = int(parts[1]) if parts[1] != "-" else 0
            return added, deleted
        except ValueError:
            return 0, 0
    return 0, 0


def parse_patterns(pattern_str: str) -> list[str]:
    """Parse comma-separated glob patterns into a list."""
    if not pattern_str or not pattern_str.strip():
        return []
    return [p.strip() for p in pattern_str.split(",") if p.strip()]


def matches_any_pattern(filepath: str, patterns: list[str]) -> bool:
    """Check if filepath matches any of the glob patterns."""
    path = PurePosixPath(filepath)
    for pattern in patterns:
        if path.match(pattern):
            return True
    return False


def filter_files(
    files: list[str],
    include_patterns: list[str],
    exclude_patterns: list[str],
) -> list[str]:
    """Filter file paths based on include/exclude glob patterns."""
    filtered = []
    for filepath in files:
        if include_patterns and not matches_any_pattern(filepath, include_patterns):
            continue
        if exclude_patterns and matches_any_pattern(filepath, exclude_patterns):
            continue
        filtered.append(filepath)
    return filtered


def split_into_batches(
    files_with_sizes: list[tuple[str, int, int, int]],
    max_batch_size: int,
) -> list[list[tuple[str, int, int, int]]]:
    """
    Split files into batches, each not exceeding max_batch_size bytes.

    Args:
        files_with_sizes: List of (filepath, diff_size, added_lines, deleted_lines)
        max_batch_size: Maximum batch size in bytes

    Returns:
        List of batches, where each batch is a list of file tuples
    """
    batches = []
    current_batch = []
    current_size = 0

    for file_info in files_with_sizes:
        filepath, diff_size, added, deleted = file_info

        # Single file exceeds max size → own batch
        if diff_size > max_batch_size:
            if current_batch:
                batches.append(current_batch)
                current_batch = []
                current_size = 0
            batches.append([file_info])
            continue

        # Adding this file would exceed max size → start new batch
        if current_size + diff_size > max_batch_size and current_batch:
            batches.append(current_batch)
            current_batch = []
            current_size = 0

        current_batch.append(file_info)
        current_size += diff_size

    if current_batch:
        batches.append(current_batch)

    return batches


def save_batch_diff(
    target_branch: str,
    batch_files: list[str],
    batch_number: int,
    output_dir: str,
) -> str:
    """Generate and save diff for a batch of files via git. Returns file path."""
    cmd = ["git", "diff", f"origin/{target_branch}...HEAD", "--"] + batch_files
    output = run_git_command(cmd)

    diff_path = os.path.join(output_dir, f"review-batch-{batch_number}.diff")
    with open(diff_path, "w", encoding="utf-8") as f:
        f.write(output)
    return diff_path


def main():
    parser = argparse.ArgumentParser(
        description="Split PR diff into batches for parallel code review"
    )
    parser.add_argument(
        "--target-branch",
        required=True,
        help="Target branch (PR base) to diff against, e.g. 'main'",
    )
    parser.add_argument(
        "--include",
        default="",
        help="Comma-separated include glob patterns (e.g. '**/*.ts, **/*.tsx')",
    )
    parser.add_argument(
        "--exclude",
        default="",
        help="Comma-separated exclude glob patterns (e.g. '**/node_modules/**, **/*.test.*')",
    )
    parser.add_argument(
        "--max-batch-size",
        type=int,
        default=100 * 1024,
        help="Max batch size in bytes (default: 100KB)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=5,
        help="Suggested concurrency for sub agents (default: 5)",
    )
    parser.add_argument(
        "--output-dir",
        default=".claude",
        help="Output directory for batch diff files (default: .claude)",
    )

    args = parser.parse_args()

    # Get changed files via git
    print(
        f"Getting changed files compared to origin/{args.target_branch}...",
        file=sys.stderr,
    )
    changed_files = get_changed_files(args.target_branch)

    if not changed_files:
        print("No files changed.", file=sys.stderr)
        result = {
            "total_files": 0,
            "total_batches": 0,
            "concurrency": args.concurrency,
            "batches": [],
        }
        print(json.dumps(result, indent=2))
        return

    print(f"Found {len(changed_files)} changed files", file=sys.stderr)

    # Apply include/exclude filters
    include_patterns = parse_patterns(args.include)
    exclude_patterns = parse_patterns(args.exclude)
    changed_files = filter_files(changed_files, include_patterns, exclude_patterns)
    print(f"After filtering: {len(changed_files)} files", file=sys.stderr)

    if not changed_files:
        result = {
            "total_files": 0,
            "total_batches": 0,
            "concurrency": args.concurrency,
            "batches": [],
        }
        print(json.dumps(result, indent=2))
        return

    # Get diff size and change stats for each file
    files_with_sizes = []
    for filepath in changed_files:
        diff = get_file_diff(args.target_branch, filepath)
        diff_size = len(diff.encode("utf-8"))
        added, deleted = get_file_change_stats(args.target_branch, filepath)
        files_with_sizes.append((filepath, diff_size, added, deleted))
        print(
            f"  {filepath}: {diff_size} bytes, +{added}/-{deleted}",
            file=sys.stderr,
        )

    # Split into batches
    batches = split_into_batches(files_with_sizes, args.max_batch_size)
    print(f"Split into {len(batches)} batches", file=sys.stderr)

    # Ensure output directory exists
    os.makedirs(args.output_dir, exist_ok=True)

    # Save batch diff files and build result
    batch_info = []
    for i, batch in enumerate(batches, 1):
        batch_files = [f[0] for f in batch]
        diff_path = save_batch_diff(
            args.target_branch, batch_files, i, args.output_dir
        )
        batch_size = sum(size for _, size, _, _ in batch)

        batch_info.append(
            {
                "batch_number": i,
                "files": batch_files,
                "file_count": len(batch_files),
                "size_bytes": batch_size,
                "diff_file": diff_path,
            }
        )
        print(
            f"  Batch {i}: {len(batch_files)} files, {batch_size} bytes -> {diff_path}",
            file=sys.stderr,
        )

    # Output result as JSON to stdout
    result = {
        "total_files": len(changed_files),
        "total_batches": len(batches),
        "concurrency": args.concurrency,
        "batches": batch_info,
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
