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

// 1. Patch Package.swift tools versions
const packageFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Package.swift'),
  path.join(__dirname, '..', 'node_modules', '@expo', 'expo-modules-macros-plugin', 'apple', 'Package.swift'),
];

for (const file of packageFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('// swift-tools-version: 6.2')) {
      content = content.replace(/\/\/ swift-tools-version: 6\.2/g, '// swift-tools-version: 6.0');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[Patch] Updated ${path.basename(file)} to swift-tools-version: 6.0`);
    }
  }
}

// 2. Patch RuntimeScheduler.h forward declarations
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
  if (!content.includes('// Forward declarations for Swift bridging')) {
    const forwardDecls = `
// Forward declarations for Swift bridging
namespace expo {
class RuntimeScheduler;
}
void retainRuntimeScheduler(expo::RuntimeScheduler *scheduler);
void releaseRuntimeScheduler(expo::RuntimeScheduler *scheduler);
`;
    content = content.replace('namespace expo {', `${forwardDecls}\nnamespace expo {`);
    fs.writeFileSync(runtimeSchedulerHeader, content, 'utf8');
    console.log('[Patch] Added forward declarations in RuntimeScheduler.h');
  }
}

// 3. Patch Swift files (weak let -> weak var, trailing commas in tuples)
const jsiDir = path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'Sources');
const swiftFiles = walkSync(jsiDir).filter(f => f.endsWith('.swift'));

for (const file of swiftFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace weak let with weak var
  if (content.includes('weak let')) {
    content = content.replace(/weak\s+let/g, 'weak var');
    changed = true;
  }

  // Remove trailing comma in parameter list: `_ arguments: consuming JavaScriptValuesBuffer,`
  if (content.includes('_ arguments: consuming JavaScriptValuesBuffer,')) {
    content = content.replace('_ arguments: consuming JavaScriptValuesBuffer,', '_ arguments: consuming JavaScriptValuesBuffer');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[Patch] Fixed Swift compatibility in ${path.relative(jsiDir, file)}`);
  }
}

console.log('[Patch] ExpoModulesJSI Swift/C++ compatibility patching complete.');
