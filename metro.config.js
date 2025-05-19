const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add SVG support
config.resolver.assetExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Add a custom resolver configuration to ensure Firebase auth component is properly registered
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs', 'mjs'];
config.resolver.unstable_enablePackageExports = false;

// Add additional resolver options
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ensure assets are properly resolved
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif'];

module.exports = config; 