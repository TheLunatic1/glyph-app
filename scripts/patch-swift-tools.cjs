const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Package.swift'),
  path.join(__dirname, '..', 'node_modules', '@expo', 'expo-modules-macros-plugin', 'apple', 'Package.swift'),
];

for (const file of targetFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('// swift-tools-version: 6.2')) {
      content = content.replace(/\/\/ swift-tools-version: 6\.2/g, '// swift-tools-version: 6.0');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[Patch] Successfully patched ${file} to swift-tools-version: 6.0`);
    }
  }
}
