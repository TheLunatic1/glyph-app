const fs = require('fs');
const path = require('path');

// 1. Patch Package.swift to disable strict isolation checks causing data race errors on C++ raw pointers
const packageFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Package.swift'),
  path.join(__dirname, '..', 'node_modules', '@expo', 'expo-modules-macros-plugin', 'apple', 'Package.swift'),
];

for (const file of packageFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove experimental isolation features causing data race errors on raw pointers
    content = content.replace(/\.enableUpcomingFeature\("NonisolatedNonsendingByDefault"\),?/g, '');
    content = content.replace(/\.enableUpcomingFeature\("InferIsolatedConformances"\),?/g, '');

    // Add -strict-concurrency=minimal to unsafeFlags if not present
    if (content.includes('.unsafeFlags([') && !content.includes('"-strict-concurrency=minimal"')) {
      content = content.replace('.unsafeFlags([', '.unsafeFlags([\n          "-strict-concurrency=minimal",');
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Patch] Updated compiler flags in ${path.basename(file)}`);
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

console.log('[Patch] ExpoModulesJSI Xcode 26 / Swift 6.2 compatibility patching complete.');
