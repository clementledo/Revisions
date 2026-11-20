// Numéro de version donné par la fabrication GitHub (v1.0.N) : sert à détecter les mises à jour.
const build = Number(process.env.REVISIONS_BUILD ?? 0);

// Polices : Inter pour le texte, Source Serif 4 (« Serif ») pour les titres (fichiers assets/fonts/<fichier>_<graisse>.ttf).
const WEIGHTS = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' };
const family = (fontFamily, file, weights = [400, 500, 600, 700, 800]) => ({
  fontFamily,
  fontDefinitions: weights.map((weight) => [weight, WEIGHTS[weight]]).map(([weight, name]) => ({
    path: `./assets/fonts/${file}_${weight}${name}.ttf`,
    weight: Number(weight),
  })),
});

module.exports = {
  expo: {
    name: 'Révisions',
    slug: 'revisions',
    version: `1.0.${build}`,
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'revisions',
    userInterfaceStyle: 'automatic',
    ios: { supportsTablet: true, bundleIdentifier: 'com.clementledo.revisions' },
    android: {
      package: 'com.clementledo.revisions',
      adaptiveIcon: {
        backgroundColor: '#ffffff',
        backgroundImage: './assets/images/android-icon-background.png',
        foregroundImage: './assets/images/android-icon-foreground.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      versionCode: Math.max(1, build),
      // Pour installer les mises à jour téléchargées par l'app.
      permissions: ['android.permission.REQUEST_INSTALL_PACKAGES'],
    },
    plugins: [
      'expo-router',
      ['expo-splash-screen', { image: './assets/images/splash-icon.png', resizeMode: 'contain', imageWidth: 120, backgroundColor: '#ffffff', dark: { backgroundColor: '#161618' } }],
      'expo-sqlite',
      ['expo-navigation-bar', { enforceContrast: false }],
      './plugins/withReleaseSigning',
      ['expo-font', { android: { fonts: [family('Inter', 'Inter'), family('Serif', 'SourceSerif4', [600, 700])] } }],
    ],
    experiments: { typedRoutes: false },
  },
};
