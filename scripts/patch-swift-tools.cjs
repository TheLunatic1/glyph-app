const fs = require('fs');
const path = require('path');

function walkSync(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// 1. Ensure Package.swift has swift-tools-version: 6.2 for Xcode 26 / Swift 6.2
const packageFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Package.swift'),
  path.join(__dirname, '..', 'node_modules', '@expo', 'expo-modules-macros-plugin', 'apple', 'Package.swift'),
];

for (const file of packageFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('// swift-tools-version: 6.0')) {
      content = content.replace(/\/\/ swift-tools-version: 6\.0/g, '// swift-tools-version: 6.2');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[Patch] Restored ${path.basename(file)} to swift-tools-version: 6.2`);
    }
  }
}

// 2. Patch RuntimeScheduler.h: strip invalid SWIFT_RETURNS_RETAINED from constructors
const runtimeSchedulerHeader = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-jsi',
  'apple',
  'Sources',
  'ExpoModulesJSI-Cxx',
  'include',
  'RuntimeScheduler.h'
);

if (fs.existsSync(runtimeSchedulerHeader)) {
  let content = fs.readFileSync(runtimeSchedulerHeader, 'utf8');
  if (content.includes('SWIFT_RETURNS_RETAINED RuntimeScheduler(')) {
    content = content.replace(/SWIFT_RETURNS_RETAINED\s+RuntimeScheduler\(/g, 'RuntimeScheduler(');
    fs.writeFileSync(runtimeSchedulerHeader, content, 'utf8');
    console.log('[Patch] Stripped invalid SWIFT_RETURNS_RETAINED from RuntimeScheduler constructors in RuntimeScheduler.h');
  }
}

// 3. Restore weak let in Swift files for Sendable conformity in Swift 6.2
const jsiDir = path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Sources');
const swiftFiles = walkSync(jsiDir).filter(f => f.endsWith('.swift'));

for (const file of swiftFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('weak var runtime: JavaScriptRuntime?')) {
    content = content.replace(/weak\s+var\s+runtime:\s*JavaScriptRuntime\?/g, 'weak let runtime: JavaScriptRuntime?');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Patch] Restored Sendable weak let in ${path.relative(jsiDir, file)}`);
  }
}

console.log('[Patch] ExpoModulesJSI Xcode 26 / Swift 6.2 compatibility patching complete.');
