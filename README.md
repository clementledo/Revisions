# Révisions

App Android de révision des cours de l'ETS (React Native + Expo).

- Chaque cours : sa page de révision (lue chapitre par chapitre, formules et calculateurs compris), cartes mémoire à répétition espacée, QCM, exercices corrigés, récaps, aide-mémoire, antisèche recto verso (export PDF) et slides importées depuis le téléphone ou Google Drive.
- Contenu : `content/source/<cours>.html` (page de révision), `content/<cours>/cartes.ts`, `content/<cours>/antiseche.html`. `npm run content` prépare les fichiers de l'app.
- APK : workflow « APK Android » (lancé à la main), publié en release ; l'app propose les mises à jour.
