const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// NOTE: @shahil_m/obfuscator-io-metro-plugin disabled due to Windows ESM path issue
// Error: "Only URLs with a scheme in: file, data, and node are supported"
// The plugin doesn't handle Windows drive letters (D:) correctly.
//
// Alternative protections still active:
// 1. Hermes bytecode compilation (enabled by default)
// 2. Aggressive R8/ProGuard for native code
// 3. Talsec freeRASP for runtime protection
// 4. SSL Pinning for network security

const config = {
  resolver: {
    // Enable JSON imports for plugin manifests
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
    // Path aliases support
    alias: {
      '@core': path.resolve(__dirname, 'packages/core'),
      '@core/config': path.resolve(__dirname, 'packages/core/config'),
      '@core/theme': path.resolve(__dirname, 'packages/core/theme'),
      '@core/i18n': path.resolve(__dirname, 'packages/core/i18n'),
      '@core/navigation': path.resolve(__dirname, 'packages/core/navigation'),
      '@core/account': path.resolve(__dirname, 'packages/core/account'),
      '@core/auth': path.resolve(__dirname, 'packages/core/auth'),
      '@plugins': path.resolve(__dirname, 'packages/plugins'),
      '@app': path.resolve(__dirname, 'src'),
    },
    // Also add to extraNodeModules for compatibility
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (name === '@core') {
            return path.resolve(__dirname, 'packages/core');
          }
          if (name === '@plugins') {
            return path.resolve(__dirname, 'packages/plugins');
          }
          if (name === '@app') {
            return path.resolve(__dirname, 'src');
          }
          return target[name];
        },
      }
    ),
  },
};

const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config);

module.exports = withNativeWind(mergedConfig, {
  input: './global.css',
});
