#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project name from command line arguments
const projectName = process.argv[2];

if (!projectName) {
  console.error('Please specify the project name:');
  console.error('  npx create-you-js <project-directory>');
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);
const templateDir = path.resolve(__dirname, '../template');

// Create project directory
if (fs.existsSync(projectDir)) {
  console.error(`Directory ${projectName} already exists.`);
  process.exit(1);
}

fs.mkdirSync(projectDir, { recursive: true });

// Function to copy directory recursively
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    // Rename _gitignore to .gitignore
    const destName = entry.name === '_gitignore' ? '.gitignore' : entry.name;
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath);
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy template files
console.log(`Creating a new You.js app in ${projectDir}...`);
copyDir(templateDir, projectDir);

// Update package.json with the new project name
const packageJsonPath = path.join(projectDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

packageJson.name = projectName;
// Reset version and description for the new project
packageJson.version = '0.1.0';
packageJson.description = 'A game built with You.js';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Done! Now run:');
console.log(`  cd ${projectName}`);
console.log('  npm install');
console.log('  npm run dev');
