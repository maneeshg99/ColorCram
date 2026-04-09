const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so Metro can resolve workspace packages
config.watchFolders = [monorepoRoot];

// Resolve modules from both the app's node_modules and the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force critical packages to resolve from the correct node_modules
// to prevent version mismatches with react-native-renderer
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, "node_modules/react"),
  "react-dom": path.resolve(monorepoRoot, "node_modules/react-dom"),
  "react-native": path.resolve(monorepoRoot, "node_modules/react-native"),
};

// Stub ExpoCryptoAES native module so expo-crypto loads in Expo Go.
// expo-auth-session has a nested dep on expo-crypto which imports from './aes',
// and aes/ExpoCryptoAES.js calls requireNativeModule('ExpoCryptoAES').
// No code actually uses AES, so we redirect that one file to an empty stub.
// Match any copy (root or nested inside expo-auth-session/node_modules).
const aesStub = path.resolve(projectRoot, "expo-crypto-aes-stub.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = (context.originModulePath || "").replace(/\\/g, "/");
  if (
    origin.endsWith("expo-crypto/build/aes/index.js") &&
    moduleName === "./ExpoCryptoAES"
  ) {
    return { type: "sourceFile", filePath: aesStub };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
