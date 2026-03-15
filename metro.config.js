const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect expo-sqlite to a shim to avoid WASM bundling errors.
  // The .web.tsx route files use web-store.tsx instead, but Metro still
  // bundles the native .tsx files which import expo-sqlite.
  if (platform === 'web' && moduleName === 'expo-sqlite') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/db/expo-sqlite-web-shim.ts'),
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
