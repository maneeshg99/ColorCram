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

module.exports = config;
