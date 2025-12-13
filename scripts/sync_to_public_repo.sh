#!/usr/bin/env bash
set -euo pipefail

# Required env:
# - SYNC_TOKEN: GitHub PAT with push access to TARGET_REPO
# - TARGET_REPO: e.g. "faithk7/faithk7.github.io-mirror"
#
# Optional env:
# - TARGET_BRANCH: default "main"
# - COMMIT_MSG: default "sync"
# - GIT_USER_NAME / GIT_USER_EMAIL: commit identity

if [[ -z "${SYNC_TOKEN:-}" ]]; then
  echo "ERROR: SYNC_TOKEN is not set"
  exit 1
fi
if [[ -z "${TARGET_REPO:-}" ]]; then
  echo "ERROR: TARGET_REPO is not set (e.g. faithk7/faithk7.github.io-mirror)"
  exit 1
fi

TARGET_BRANCH="${TARGET_BRANCH:-main}"
COMMIT_MSG="${COMMIT_MSG:-sync}"

GIT_USER_NAME="${GIT_USER_NAME:-github-actions[bot]}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"

ROOT_DIR="$(pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

git config --global user.name "${GIT_USER_NAME}"
git config --global user.email "${GIT_USER_EMAIL}"

TARGET_URL="https://x-access-token:${SYNC_TOKEN}@github.com/${TARGET_REPO}.git"

echo "Cloning target ${TARGET_REPO} (${TARGET_BRANCH})..."
git clone --depth 1 --branch "${TARGET_BRANCH}" "${TARGET_URL}" "${TMP_DIR}/target"

echo "Syncing files (snapshot, no history carry-over)..."
rsync -a --delete \
  --exclude ".git/" \
  --exclude ".github/" \
  --exclude ".env" \
  --exclude ".env.*" \
  --exclude "_site/" \
  --exclude "vendor/" \
  --exclude ".bundle/" \
  --exclude ".DS_Store" \
  "${ROOT_DIR}/" "${TMP_DIR}/target/"

cd "${TMP_DIR}/target"
git add -A

if git diff --cached --quiet; then
  echo "No changes to sync; exiting."
  exit 0
fi

git commit -m "${COMMIT_MSG}"
git push origin "${TARGET_BRANCH}"

echo "Done."


