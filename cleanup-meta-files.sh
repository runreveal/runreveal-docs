#!/bin/bash

# Script to remove old _meta.json files after migration
# IMPORTANT: Only run this script after verifying that the _meta.ts files work correctly

echo "This script will remove all _meta.json files from the pages directory."
echo "Make sure you have already verified that the _meta.ts files work correctly."
read -p "Are you sure you want to continue? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Count the number of files that will be removed
count=$(find ./pages -name "_meta.json" | wc -l)
echo "Found $count _meta.json files to remove."

# Remove all _meta.json files
find ./pages -name "_meta.json" -exec rm {} \;

echo "All _meta.json files have been removed."
echo "You can now remove the meta-json-backup directory if everything works correctly."