#!/usr/bin/env bash

set -e

echo "Copying gradle.properties template with Jetifier enabled..."

if [ -f "gradle.properties.template" ]; then
  if [ -d "android" ]; then
    cp gradle.properties.template android/gradle.properties
    echo "✓ gradle.properties copied successfully"
  else
    echo "⚠ android directory not found, skipping gradle.properties copy"
  fi
else
  echo "⚠ gradle.properties.template not found"
fi
