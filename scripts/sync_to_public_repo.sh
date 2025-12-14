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

detect_default_branch() {
  # Output: branch name, or empty if repo is empty / cannot be detected.
  # Example output: "ref: refs/heads/master\tHEAD"
  git ls-remote --symref "${TARGET_URL}" HEAD 2>/dev/null \
    | awk '/^ref:/ {sub("refs/heads/","",$2); print $2; exit}'
}

REMOTE_DEFAULT_BRANCH="$(detect_default_branch || true)"

if [[ "${TARGET_BRANCH}" == "auto" || "${TARGET_BRANCH}" == "" ]]; then
  if [[ -n "${REMOTE_DEFAULT_BRANCH}" ]]; then
    TARGET_BRANCH="${REMOTE_DEFAULT_BRANCH}"
  else
    TARGET_BRANCH="main"
  fi
fi

echo "Preparing target ${TARGET_REPO} (branch: ${TARGET_BRANCH})..."

# If repo is empty, ls-remote --heads returns nothing. We'll init a new repo locally and push.
if ! git ls-remote --heads "${TARGET_URL}" >/dev/null 2>&1 || [[ -z "$(git ls-remote --heads "${TARGET_URL}" 2>/dev/null)" ]]; then
  echo "Target repo appears empty; initializing new branch ${TARGET_BRANCH}..."
  mkdir -p "${TMP_DIR}/target"
  cd "${TMP_DIR}/target"
  git init
  git remote add origin "${TARGET_URL}"
  git checkout -b "${TARGET_BRANCH}"
else
  echo "Cloning target repo..."
  if ! git clone --depth 1 --branch "${TARGET_BRANCH}" "${TARGET_URL}" "${TMP_DIR}/target"; then
    if [[ -n "${REMOTE_DEFAULT_BRANCH}" && "${REMOTE_DEFAULT_BRANCH}" != "${TARGET_BRANCH}" ]]; then
      echo "Branch ${TARGET_BRANCH} not found; falling back to remote default branch ${REMOTE_DEFAULT_BRANCH}..."
      TARGET_BRANCH="${REMOTE_DEFAULT_BRANCH}"
      git clone --depth 1 --branch "${TARGET_BRANCH}" "${TARGET_URL}" "${TMP_DIR}/target"
    else
      echo "ERROR: Failed to clone target repo/branch. Check TARGET_BRANCH or remote default branch."
      exit 1
    fi
  fi
fi

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
git push -u origin "${TARGET_BRANCH}"

echo "Done."


