// Les pages de révision (.html) sont embarquées comme fichiers dans l'APK.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('html');

module.exports = config;
