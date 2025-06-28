#!/bin/bash

# Clean up broken validation code in service files
files=(
  "src/services/serviceService.ts"
  "src/services/followerCommissionService.ts" 
  "src/services/businessPromotionService.ts"
)

for file in "${files[@]}"; do
  echo "Cleaning up $file"
  # Remove validation references and fix broken code blocks
  perl -i -pe '
    # Remove lines with validation references
    s/.*validation\.(isValid|errors|missingEpics|completedEpics|userStatus).*//g;
    # Remove if (!validation.isValid) blocks
    s/.*if \(!validation\.isValid\).*//g;
    # Remove validation variable references
    s/.*validation\s*=.*//g;
    # Remove throw error blocks that reference validation
    s/.*throw new Error\(`.*validation\..*//g;
    # Remove console.log with validation references  
    s/.*console\.(log|error).*validation.*//g;
    # Remove empty lines that were left behind
    s/^\s*$//g if $. > 1 and $prev_empty;
    $prev_empty = /^\s*$/;
  ' "$file"
done