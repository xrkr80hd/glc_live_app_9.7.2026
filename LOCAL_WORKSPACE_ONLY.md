# Local Workspace Policy (Required)

This project must be worked from the local machine path only.

## Approved Workspace

`/Users/xrkr80hd/Projects/golibertychurch_app`

## Do Not Use (Reference/Backup Only)

`/Users/xrkr80hd/Library/CloudStorage/OneDrive-Personal/glc_new_site/...`

## Rules

1. Do not run build/dev/test commands from any OneDrive path.
2. Do not edit files in the OneDrive copy.
3. Do not commit/push from the OneDrive copy.
4. If the current working directory includes `OneDrive`, stop and switch to:
   `cd /Users/xrkr80hd/Projects/golibertychurch_app`

## Purpose

Prevent sync conflicts, file locks, and stale edits from cloud-synced directories.
