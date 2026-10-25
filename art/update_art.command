#!/bin/bash
cd "$(dirname "$0")" || exit 1
# Finder does not inherit the PATH used in an interactive Terminal window.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
./update_art.sh
result=$?
printf '\n'
if [ "$result" -eq 0 ]; then
    printf 'Artwork updated. You can preview art/index.html.\n'
else
    printf 'Update failed. Read the error above; then run this again.\n'
fi
if [ -t 0 ]; then
    read -r -p 'Press Return to close this window. '
fi
exit "$result"
