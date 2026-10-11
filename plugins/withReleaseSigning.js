// Signe l'APK de release avec la clé de Révisions quand REVISIONS_KEYSTORE est défini
// (fabrication sur GitHub). Une signature stable permet d'installer chaque nouvelle
// version par-dessus l'ancienne sans perdre la progression.
const { withAppBuildGradle } = require('expo/config-plugins');

const RELEASE_CONFIG = `
        release {
            if (System.getenv('REVISIONS_KEYSTORE')) {
                storeFile file(System.getenv('REVISIONS_KEYSTORE'))
                storePassword System.getenv('REVISIONS_KEYSTORE_PASSWORD')
                keyAlias System.getenv('REVISIONS_KEY_ALIAS')
                keyPassword System.getenv('REVISIONS_KEY_PASSWORD')
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes("System.getenv('REVISIONS_KEYSTORE')")) return cfg;

    gradle = gradle.replace(/signingConfigs \{/, (m) => m + RELEASE_CONFIG);
    gradle = gradle.replace(
      /(release \{\s*\/\/ Caution![^\n]*\n[^\n]*\n\s*)signingConfig signingConfigs\.debug/,
      "$1signingConfig System.getenv('REVISIONS_KEYSTORE') ? signingConfigs.release : signingConfigs.debug",
    );
    if (!gradle.includes('signingConfigs.release : signingConfigs.debug')) {
      throw new Error('withReleaseSigning: bloc release introuvable dans build.gradle');
    }
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
