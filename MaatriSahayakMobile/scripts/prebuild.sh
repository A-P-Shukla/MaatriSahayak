#!/bin/bash
set -e

echo "Running expo prebuild..."
npx expo prebuild --platform android --clean

echo "Copying gradle.properties template..."
cp gradle.properties.template android/gradle.properties

echo "Prebuild complete!"
