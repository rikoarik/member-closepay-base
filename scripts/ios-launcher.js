const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const SCHEME = 'memberBaseApp';
const WORKSPACE = 'ios/MemberBaseApp.xcworkspace';
const BUNDLE_ID = 'com.closepay.member.base';
const APP_NAME = 'MemberBaseApp.app';
const CONFIGURATION = 'Debug';

function runCommand(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    if (options.ignoreError) return null;
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function getSimulators() {
  const json = runCommand('xcrun simctl list devices available --json');
  try {
    const data = JSON.parse(json);
    return data.devices;
  } catch (e) {
    console.error('Failed to parse simulator list');
    process.exit(1);
  }
}

function findTargetSimulator(args) {
  // Check if a specific simulator specificed in args (e.g. --simulator="iPhone 16")
  const simArgIndex = args.findIndex(arg => arg.startsWith('--simulator='));
  let requestedName = null;
  if (simArgIndex !== -1) {
    requestedName = args[simArgIndex].split('=')[1];
  }

  const devicesMap = getSimulators();
  let bootedSimulator = null;
  let fallbackSimulator = null;
  let requestedSimulator = null;

  for (const runtime in devicesMap) {
    // We only care about iOS simulators usually, but let's check generic
    if (!runtime.includes('iOS')) continue;

    const devices = devicesMap[runtime];
    for (const device of devices) {
      if (requestedName && device.name === requestedName) {
        requestedSimulator = device;
        break;
      }
      if (device.state === 'Booted' && !bootedSimulator) {
        bootedSimulator = device;
      }
      // Pick a modern iPhone as fallback if nothing booted
      if (!fallbackSimulator && device.name.includes('iPhone')) {
        fallbackSimulator = device;
      }
    }
    if (requestedSimulator) break;
  }

  if (requestedSimulator) {
    console.log(`Using requested simulator: ${requestedSimulator.name} (${requestedSimulator.udid})`);
    return requestedSimulator;
  }
  
  if (bootedSimulator) {
    console.log(`Using booted simulator: ${bootedSimulator.name} (${bootedSimulator.udid})`);
    return bootedSimulator;
  }

  if (fallbackSimulator) {
    console.log(`Using fallback simulator: ${fallbackSimulator.name} (${fallbackSimulator.udid})`);
    return fallbackSimulator;
  }

  console.error('No suitable simulator found.');
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  const targetSim = findTargetSimulator(args);
  const udid = targetSim.udid;

  // Boot if not booted
  if (targetSim.state !== 'Booted') {
    console.log(`Booting ${targetSim.name}...`);
    runCommand(`xcrun simctl boot ${udid}`, { ignoreError: true }); // Ignore if already booting
    // Wait a bit or verify? Usually xcodebuild handles it if we pass destination correctly, 
    // but booting explicitly is safer for simctl launch later.
    runCommand(`open -a Simulator`); 
  }

  console.log(`Building for ${targetSim.name}...`);
  
  // Build
  // We use spawn for the build to stream output if needed, or just execSync with stdio inherit
  try {
    execSync(
      `xcodebuild -workspace ${WORKSPACE} -scheme ${SCHEME} -configuration ${CONFIGURATION} -destination "platform=iOS Simulator,id=${udid}"`,
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.error('Build failed.');
    process.exit(1);
  }

  console.log('Installing app...');
  // Find the build product path. It usually lives in derived data. 
  // We can try to use the derived data path relative to the workspace or handle it dynamically.
  // The original script assumed `~/Library/Developer/Xcode/DerivedData/memberBaseApp-*/...` 
  // Use -derivedDataPath to be deterministic? 
  // Or just check existing locations. 
  // Let's use `xcodebuild -showBuildSettings` to find it reliably.
  
  const buildSettingsJson = runCommand(
    `xcodebuild -workspace ${WORKSPACE} -scheme ${SCHEME} -configuration ${CONFIGURATION} -destination "platform=iOS Simulator,id=${udid}" -showBuildSettings -json`
  );
  let buildSettings;
  try {
     // The output might be an array of settings objects
     const parsed = JSON.parse(buildSettingsJson);
     // Usually the first one is the target
     buildSettings = parsed.length ? parsed[0].buildSettings : parsed.buildSettings;
  } catch (e) {
     console.error('Could not determine build settings.');
     // Fallback to the original path guessing if json parsing fails
  }

  let appPath;
  if (buildSettings && buildSettings.WRAPPER_NAME && buildSettings.TARGET_BUILD_DIR) {
    appPath = path.join(buildSettings.TARGET_BUILD_DIR, buildSettings.WRAPPER_NAME);
  } else {
    // Fallback: This is risky if derived data is custom, but matches original script logic roughly
    // better to fail if we can't find it
    console.error("Could not determine APP_PATH from build settings.");
    process.exit(1);
  }

  console.log(`Installing ${appPath} to ${udid}...`);
  runCommand(`xcrun simctl install ${udid} "${appPath}"`);

  console.log(`Launching ${BUNDLE_ID}...`);
  runCommand(`xcrun simctl launch ${udid} ${BUNDLE_ID}`);
  
  console.log('Done!');
}

main();
