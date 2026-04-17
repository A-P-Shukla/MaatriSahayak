#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running expo prebuild...');
execSync('npx expo prebuild --platform android --clean', { stdio: 'inherit' });

console.log('Copying gradle.properties template...');
const templatePath = path.join(__dirname, '..', 'gradle.properties.template');
const targetPath = path.join(__dirname, '..', 'android', 'gradle.properties');
fs.copyFileSync(templatePath, targetPath);

console.log('Prebuild complete!');
