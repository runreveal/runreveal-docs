#!/bin/bash

# Script to convert _meta.json files to _meta.ts files
find ./pages -name "_meta.json" | while read -r file; do
  dir=$(dirname "$file")
  ts_file="$dir/_meta.ts"
  
  # Create the TypeScript file
  echo "export default $(cat "$file")" > "$ts_file"
  
  echo "Converted $file to $ts_file"
done

# Don't delete the original files yet - let's back them up
mkdir -p ./meta-json-backup
find ./pages -name "_meta.json" | while read -r file; do
  backup_file="./meta-json-backup/$(echo $file | sed 's/\//_/g')"
  cp "$file" "$backup_file"
  echo "Backed up $file to $backup_file"
done