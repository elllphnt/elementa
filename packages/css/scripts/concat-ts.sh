#!/bin/bash

# Define the folder you want to scan
FOLDER=$1

# Define the output file
OUTPUT="combined_output.txt"

# Clean previous output
rm -f "$OUTPUT"

# Loop through all .ts files recursively
find "$FOLDER" -type f -name "*.ts" | while read file; do
  echo "===== FILE: $file =====" >> "$OUTPUT"
  cat "$file" >> "$OUTPUT"
  echo -e "\n\n" >> "$OUTPUT"
done

echo "✅ Done! Output saved to $OUTPUT"
