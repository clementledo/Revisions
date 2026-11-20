// Exercices de tri du chapitre Lean, repris des diapos de la séance 2 (« Lean », D. Tremblay) :
// gaspillages (diapos 26 à 37), 14 principes du Toyota Way (diapos 10 à 13), moyens de réduction (diapos 38 à 41).
// Chaque élément a sa description (celle des diapos) et un exemple concret pour voir à quoi il correspond.
import type { SortExercise, SortFamily } from '@/lib/types';

const wastes: SortFamily[] = [
  { id: 'surprod', title: 'Surproduction', sub: 'Produire plus que nécessaire, ou trop tôt' },
  { id: 'attente', title: 'Attente', sub: 'Une personne ou un travail qui attend' },
  { id: 'transport', title: 'Transport', sub: 'Faire circuler documents, données, travail' },
  { id: 'traitement', title: 'Traitements inutiles', sub: 'Étapes ou complexité qui n’apportent rien' },
  { id: 'stocks', title: 'Stocks', sub: 'Travail en cours ou terminé qui dort' },
  { id: 'mouvements', title: 'Mouvements inutiles', sub: 'Déplacements, changements de contexte' },
  { id: 'defauts', title: 'Défauts', sub: 'Non-qualité : erreurs, reprises' },
  { id: 'competences', title: 'Sous-utilisation des compétences', sub: 'Le « +1 » : potentiel des employés' },
];

export const leanWastes: SortExercise = {
  id: 'gaspillages',
  title: 'Les 8 gaspillages',
  chapter: 'lean',
  intro: 'Une situation s’affiche : trouve le gaspillage (muda) qu’elle illustre.',
  prompt: 'Quel gaspillage ?',
  unit: 'situations',
  families: wastes,
  items: [
    // Surproduction
    { name: 'Coder des fonctionnalités « au cas où » que personne n’a demandées', family: 'surprod', def: 'Gold plating : chaque ligne de code inutile augmente la complexité et le risque. C’est le pire des gaspillages, car il en entraîne d’autres.', ex: 'L’équipe ajoute un export PDF, Excel et XML à l’outil de tickets alors que les agents n’utilisent que l’écran.' },
    { name: 'Produire un rapport mensuel que personne ne lit', family: 'surprod', def: 'Produire plus que ce qui est nécessaire pour l’étape suivante.', ex: 'Le centre de services envoie chaque mois un rapport de 30 pages sur les tickets ; aucun gestionnaire ne l’ouvre.' },
    { name: 'Intégrer de l’IA « pour la tendance », sans cas d’usage validé', family: 'surprod', def: 'Sur-optimisation à l’ère de l’IA : modèles trop complexes, prédictions non exploitées.', ex: 'Un chatbot génératif est ajouté au portail étudiant sans savoir quelles questions il doit traiter.' },
    // Attente
    { name: 'Un ticket attend 3 jours l’approbation d’un comité', family: 'attente', def: 'Temps perdu à attendre : validation, décision d’un comité, prochaine fenêtre de déploiement.', ex: 'Une demande d’accès simple reste bloquée jusqu’à la réunion hebdomadaire du gestionnaire qui doit signer.' },
    { name: 'Attendre la prochaine fenêtre de déploiement pour livrer un correctif prêt', family: 'attente', def: 'Le travail est fini mais attend une étape suivante qui n’est pas disponible.', ex: 'Le correctif est testé lundi, mais les mises en production n’ont lieu que le premier samedi du mois.' },
    { name: 'Attendre l’accès aux données ou la fin de l’entraînement d’un modèle', family: 'attente', def: 'Les nouvelles latences de l’ère de l’IA : accès, nettoyage, étiquetage des données, entraînement (heures ou jours).', ex: 'Le data scientist patiente deux semaines que la sécurité lui ouvre l’accès à la base des inscriptions.' },
    // Transport
    { name: 'Passation analyste → développeur → testeur, avec perte d’information à chaque étape', family: 'transport', def: 'Transferts excessifs d’informations et d’artefacts entre silos : chaque handoff est un risque de perte et de délai.', ex: 'Le besoin du client est réécrit trois fois ; le testeur découvre un comportement que l’analyste n’avait jamais demandé.' },
    { name: 'Un document circule de bureau en bureau pour être signé', family: 'transport', def: 'Déplacement de documents qui n’ajoute aucune valeur pour le client (chemin de signature).', ex: 'Un bon de commande de portable passe par 4 signatures papier avant d’arriver aux achats.' },
    { name: 'Des pipelines de données fragiles qui transfèrent les modèles entre équipes', family: 'transport', def: 'Circulation inefficiente des données et des modèles entre Data Science, MLOps et SecOps.', ex: 'Le modèle est envoyé par courriel en fichier compressé à l’équipe qui doit le mettre en production.' },
    // Traitements inutiles
    { name: 'Rédiger une documentation de 80 pages que personne ne lit', family: 'traitement', def: 'Processus bureaucratiques lourds, documentation excessive.', ex: 'Chaque petit changement exige un document d’architecture complet, même pour modifier un libellé.' },
    { name: 'Une architecture trop complexe pour le besoin réel', family: 'traitement', def: 'Sur-ingénierie et réinvention de la roue : étapes non nécessaires venant d’une conception inadaptée.', ex: 'Un formulaire de contact interne est bâti en microservices avec file de messages et trois bases de données.' },
    { name: 'Ré-entraîner un modèle à la main au lieu d’automatiser', family: 'traitement', def: 'Complexité superflue à l’ère de l’IA : sur-nettoyage des données, ré-entraînement manuel.', ex: 'Chaque mois, un analyste relance à la main les mêmes 12 scripts pour mettre le modèle à jour.' },
    // Stocks
    { name: 'Du code terminé mais jamais fusionné ni testé', family: 'stocks', def: 'Travail en cours (WIP) : rien de tout cela n’a de valeur pour le client.', ex: 'Quinze branches Git attendent une revue depuis plus d’un mois.' },
    { name: 'Une application complète en attente de déploiement', family: 'stocks', def: 'Produit fini qui dort au lieu d’être livré.', ex: 'Le nouveau portail est prêt depuis septembre, mais sa mise en ligne est repoussée à janvier.' },
    { name: 'Des modèles d’IA entraînés mais jamais déployés', family: 'stocks', def: 'Les actifs numériques dormants : modèles, jeux de données achetés ou étiquetés mais non utilisés.', ex: 'L’université a payé l’étiquetage de 50 000 images qui n’ont jamais servi à un modèle en production.' },
    // Mouvements
    { name: 'Changer de tâche toutes les 20 minutes à cause des interruptions', family: 'mouvements', def: 'Changement de contexte constant pour un employé.', ex: 'Un développeur est sollicité sur Teams, par courriel et en personne pendant qu’il code : il perd le fil à chaque fois.' },
    { name: 'Chercher une information dans cinq outils différents', family: 'mouvements', def: 'Naviguer entre de multiples outils, chercher des informations, assister à des réunions inutiles.', ex: 'Pour répondre à un ticket, l’agent ouvre l’outil de tickets, le wiki, SharePoint, la CMDB et ses courriels.' },
    { name: 'Se déplacer à l’autre bout de l’édifice pour poser une question', family: 'mouvements', def: 'Tout déplacement de personnes, transportant ou non un produit.', ex: 'Le technicien traverse le campus pour aller chercher un câble rangé dans un autre local.' },
    // Défauts
    { name: 'Des bugs découverts en production', family: 'defauts', def: 'Non-qualité : les bugs trouvés en production sont les plus coûteux.', ex: 'Une mise à jour du portail empêche 300 étudiants de payer leurs frais de scolarité.' },
    { name: 'Refaire le travail parce que le besoin a été mal compris', family: 'defauts', def: 'Mauvaise interprétation des besoins obligeant à refaire (rework), dette technique.', ex: 'Le rapport livré présente les données par session alors que le client les voulait par programme : tout est à refaire.' },
    { name: 'Biais, hallucinations ou dérive d’un modèle en production', family: 'defauts', def: 'Les nouveaux visages de la non-qualité à l’ère de l’IA.', ex: 'Le chatbot invente une date limite d’inscription qui n’existe pas.' },
    // Compétences
    { name: 'Un expert senior affecté à des réinitialisations de mots de passe', family: 'competences', def: 'Assigner des experts seniors à des tâches subalternes.', ex: 'L’architecte réseau passe ses matinées au comptoir de soutien à débloquer des comptes.' },
    { name: 'Les suggestions de l’équipe de terrain sont ignorées', family: 'competences', def: 'Ne pas écouter ceux qui sont sur le terrain : perte d’idées et de possibilités d’amélioration.', ex: 'Les agents proposent depuis un an un article de libre-service pour le VPN ; personne ne donne suite.' },
    { name: 'Des data scientists réduits à étiqueter des données', family: 'competences', def: 'La dichotomie des compétences à l’ère de l’IA : experts sur des tâches répétitives, employés réduits à superviser l’IA.', ex: 'Deux data scientists passent un mois à classer des images à la main au lieu de concevoir le modèle.' },
  ],
};

export const toyotaPrinciples: SortExercise = {
  id: 'toyota',
  title: 'Les 14 principes de Toyota',
  chapter: 'lean',
  intro: 'Un principe du Toyota Way s’affiche : range-le dans sa section des 4P.',
  prompt: 'Quelle section des 4P ?',
  unit: 'principes',
  families: [
    { id: 'philo', title: 'Philosophie', sub: 'Vision à long terme (principe 1)' },
    { id: 'process', title: 'Processus', sub: 'Le bon processus produit les bons résultats (2 à 8)' },
    { id: 'people', title: 'Personnel et partenaires', sub: 'Développer collaborateurs et partenaires (9 à 11)' },
    { id: 'pb', title: 'Résolution de problèmes', sub: 'Moteur de l’apprentissage organisationnel (12 à 14)' },
  ],
  items: [
    { name: '1. Décider selon une vision à long terme, même au détriment du court terme', family: 'philo', def: 'Agir avec une conscience de sa mission : contribuer à l’économie, à la société et à la croissance de l’entreprise. C’est la base de tous les autres principes.', ex: 'Les TI investissent dans l’automatisation des déploiements même si le projet ne rapporte rien cette année.' },
    { name: '2. Créer un flux continu pour faire apparaître les problèmes', family: 'process', def: 'Concevoir les processus pour éliminer les arrêts et les stocks inutiles, et faire remonter les problèmes immédiatement.', ex: 'Chaque ticket passe directement de l’agent au technicien, sans file intermédiaire où il pourrait dormir.' },
    { name: '3. Utiliser le flux tiré pour éviter la surproduction', family: 'process', def: 'Produire uniquement ce que le client demande, quand il le demande, dans la quantité demandée : le juste-à-temps.', ex: 'Les portables ne sont configurés qu’à la réception d’une demande, pas à l’avance « pour être prêts ».' },
    { name: '4. Niveler la charge de travail (Heijunka)', family: 'process', def: 'Éviter les pics et les creux : lisser la charge pour éliminer la surcharge (Muri) et l’irrégularité (Mura).', ex: 'Les renouvellements de comptes sont étalés sur l’été plutôt que tous traités la semaine de la rentrée.' },
    { name: '5. Arrêter la production pour régler les problèmes (Jidoka)', family: 'process', def: 'Chaque employé a le pouvoir et le devoir d’arrêter le processus dès qu’un défaut est détecté : la qualité dès le premier coup.', ex: 'Le pipeline CI bloque automatiquement le déploiement dès qu’un test échoue.' },
    { name: '6. Standardiser les tâches, base de l’amélioration continue', family: 'process', def: 'Des processus documentés, clairs et stables : ce n’est qu’à partir d’un standard qu’on peut mesurer une amélioration.', ex: 'Tous les agents suivent la même procédure écrite pour créer un compte étudiant.' },
    { name: '7. Utiliser le contrôle visuel pour qu’aucun problème ne reste caché', family: 'process', def: 'Des indicateurs simples et visibles (Andon, Kanban) pour voir d’un coup d’œil si le processus est normal ou non.', ex: 'Un tableau Kanban affiché dans l’équipe montre les tickets bloqués en rouge.' },
    { name: '8. N’utiliser que des technologies fiables et éprouvées', family: 'process', def: 'La technologie soutient les personnes sans les remplacer, et n’est adoptée qu’après des tests rigoureux sur le terrain.', ex: 'Le nouvel outil de supervision est testé trois mois sur un seul service avant d’être généralisé.' },
    { name: '9. Former des leaders qui connaissent le terrain et enseignent la philosophie', family: 'people', def: 'Les leaders sont des experts du terrain (Genchi Genbutsu) et des coachs qui incarnent la culture.', ex: 'Le chef du centre de services prend lui-même des appels une demi-journée par semaine et forme les nouveaux.' },
    { name: '10. Développer des collaborateurs et des équipes exceptionnels', family: 'people', def: 'Le succès repose sur les équipes : investir dans la formation, la polyvalence et la culture.', ex: 'Chaque technicien apprend deux domaines (réseau et postes de travail) pour pouvoir remplacer un collègue.' },
    { name: '11. Respecter et faire progresser ses partenaires et fournisseurs', family: 'people', def: 'Les fournisseurs sont une extension de l’entreprise : travailler sur le long terme, partager risques et bénéfices.', ex: 'Les TI invitent leur fournisseur infonuagique aux revues trimestrielles et améliorent les processus avec lui.' },
    { name: '12. Aller sur le terrain pour comprendre la situation (Genchi Genbutsu)', family: 'pb', def: 'Ne pas se fier aux rapports : aller voir le problème de ses propres yeux, là où le travail se fait (Gemba).', ex: 'Le gestionnaire passe une matinée au comptoir de soutien pour voir pourquoi les files d’attente s’allongent.' },
    { name: '13. Décider lentement par consensus, mettre en œuvre rapidement (Nemawashi)', family: 'pb', def: 'Une décision inclusive qui cherche les causes profondes et explore toutes les options ; ensuite, l’exécution est rapide.', ex: 'Avant de changer d’outil de tickets, toutes les équipes sont consultées ; une fois le choix fait, la migration se fait en un mois.' },
    { name: '14. Devenir une organisation apprenante (Hansei et Kaizen)', family: 'pb', def: 'Des moments de réflexion après chaque projet pour identifier les faiblesses, standardiser les bonnes pratiques et recommencer le cycle PDCA.', ex: 'Après chaque panne majeure, l’équipe fait une rétrospective et met à jour la procédure.' },
  ],
};

export const leanFixes: SortExercise = {
  id: 'solutions',
  title: 'Solutions aux gaspillages',
  chapter: 'lean',
  intro: 'Un moyen de réduction s’affiche : trouve le gaspillage qu’il élimine.',
  prompt: 'Quel gaspillage élimine-t-il ?',
  unit: 'solutions',
  families: wastes,
  items: [
    // Surproduction
    { name: 'Développement itératif (Agile/Scrum)', family: 'surprod', def: 'Livrer de petites fonctionnalités à haute valeur ajoutée à chaque cycle.', ex: 'Le portail est livré par sprints de deux semaines, en commençant par les fonctions les plus demandées.' },
    { name: 'Produit minimum viable (MVP)', family: 'surprod', def: 'Construire uniquement le strict nécessaire pour valider une hypothèse et recueillir du feedback.', ex: 'Avant de bâtir une application de réservation de salles, on teste un simple formulaire en ligne pendant un mois.' },
    { name: 'Principe YAGNI (« You Ain’t Gonna Need It »)', family: 'surprod', def: 'Ne jamais coder quelque chose « au cas où ».', ex: 'Le développeur renonce à prévoir un mode multilingue tant que personne ne l’a demandé.' },
    { name: 'Preuve de valeur (Proof of Value) et modèle de base simple', family: 'surprod', def: 'Valider le cas d’affaires et le retour attendu avant de construire un modèle complexe ; commencer par le modèle le plus simple.', ex: 'Avant de lancer un projet d’IA de prédiction d’abandon, on vérifie qu’une simple règle ne suffit pas.' },
    { name: 'Gérer les modèles d’IA comme des produits (Model as a Product)', family: 'surprod', def: 'Un Product Manager s’assure que chaque fonctionnalité du modèle répond à un besoin utilisateur clair.', ex: 'Le responsable du modèle refuse d’ajouter une prédiction que personne ne compte utiliser.' },
    // Attente
    { name: 'Intégration et déploiement continus (CI/CD)', family: 'attente', def: 'Automatiser le pipeline de livraison pour éliminer les temps d’attente manuels.', ex: 'Un correctif validé part en production en 20 minutes au lieu d’attendre la fenêtre mensuelle.' },
    { name: 'Limites de travail en cours (WIP) pour voir les goulots', family: 'attente', def: 'Utiliser des tableaux Kanban pour visualiser les goulets d’étranglement et forcer la résolution des blocages.', ex: 'La colonne « En test » est limitée à 3 tickets : quand elle est pleine, toute l’équipe aide à tester.' },
    { name: 'Équipes autonomes et pluridisciplinaires', family: 'attente', def: 'Donner aux équipes le pouvoir de décider sans attendre l’approbation de multiples comités.', ex: 'L’équipe approuve elle-même les changements standards sans passer par le CAB.' },
    { name: 'DataOps : données en libre-service', family: 'attente', def: 'Des pipelines de données automatisés et en libre-service pour accéder vite et de façon fiable aux données qualifiées.', ex: 'Le data scientist obtient en une heure un jeu de données anonymisé au lieu d’attendre deux semaines.' },
    { name: 'MLOps : automatiser l’entraînement et le déploiement des modèles', family: 'attente', def: 'Automatiser le ré-entraînement et le déploiement pour éliminer les phases d’attente manuelles.', ex: 'Le modèle se ré-entraîne seul chaque nuit avec les nouvelles données.' },
    { name: 'Infonuagique et calcul élastique (GPU/TPU)', family: 'attente', def: 'Réduire le temps d’entraînement grâce à des ressources de calcul élastiques et puissantes.', ex: 'L’entraînement qui prenait 3 jours sur le serveur local prend 4 heures sur des GPU loués dans le nuage.' },
    // Transport
    { name: 'Équipes co-localisées et communication directe', family: 'transport', def: 'Favoriser les interactions directes (pair programming, stand-ups) plutôt que les longs documents.', ex: 'L’analyste et le développeur s’assoient ensemble pour clarifier le besoin au lieu de s’échanger des documents.' },
    { name: 'Source unique de vérité (wiki, backlog partagé)', family: 'transport', def: 'Des outils collaboratifs pour que l’information soit accessible à tous, ce qui réduit les transferts.', ex: 'Toutes les décisions du projet sont dans un seul wiki plutôt que dans des courriels transférés.' },
    { name: 'Approche DevOps', family: 'transport', def: 'Casser les silos entre le développement (Dev) et les opérations (Ops).', ex: 'Les développeurs et les administrateurs système font partie de la même équipe et livrent ensemble.' },
    { name: 'Plateforme de ML centralisée', family: 'transport', def: 'Une plateforme unifiée (Databricks, SageMaker, Vertex AI) où données, expériences, modèles et déploiement sont au même endroit.', ex: 'Les data scientists et l’équipe MLOps travaillent dans le même espace, sans se renvoyer de fichiers.' },
    { name: 'Registre de modèles (Model Registry)', family: 'transport', def: 'Un référentiel unique des modèles entraînés avec leur lignée, leurs versions et leurs performances.', ex: 'L’équipe de production récupère la bonne version du modèle dans le registre au lieu de la demander par courriel.' },
    // Traitements inutiles
    { name: 'Simplicité de conception (KISS)', family: 'traitement', def: 'Toujours privilégier la solution la plus simple qui répond au besoin.', ex: 'Pour un formulaire interne, on utilise Microsoft Forms plutôt que de développer une application.' },
    { name: 'Revue de code en pair (Pair Review)', family: 'traitement', def: 'Valider la qualité et la pertinence du travail de manière efficace.', ex: 'Une revue de 15 minutes entre deux développeurs remplace un long processus d’approbation formel.' },
    { name: 'Automatiser les tâches répétitives', family: 'traitement', def: 'Des scripts pour automatiser les tâches manuelles sujettes aux erreurs (tests, déploiements).', ex: 'Un script crée les 400 comptes étudiants de la rentrée au lieu d’une saisie un par un.' },
    { name: 'Commencer par des modèles simples (régression, arbres de décision)', family: 'traitement', def: 'Ne pas sauter directement à l’apprentissage profond : des modèles plus simples, plus rapides et interprétables.', ex: 'Un arbre de décision suffit à classer les tickets par priorité, sans réseau de neurones.' },
    { name: 'Explicabilité de l’IA (XAI : SHAP, LIME)', family: 'traitement', def: 'Comprendre les décisions des modèles, ce qui évite les processus manuels de justification et augmente la confiance.', ex: 'SHAP montre pourquoi un étudiant est signalé à risque, sans qu’un analyste doive tout justifier à la main.' },
    // Stocks
    { name: 'Limitation stricte du WIP : finir avant de commencer', family: 'stocks', def: 'Forcer l’équipe à terminer ce qui est commencé avant de prendre de nouvelles tâches.', ex: 'Chaque développeur a au plus deux tickets en cours ; il termine avant d’en prendre un troisième.' },
    { name: 'Petits lots de livraison (Small Batches)', family: 'stocks', def: 'Déployer de très petites modifications fréquemment plutôt que de gros « big bang » trimestriels.', ex: 'L’équipe livre chaque semaine quelques corrections au lieu d’une grosse version tous les trois mois.' },
    { name: 'Bascules de fonctionnalités (Feature Flags)', family: 'stocks', def: 'Déployer du code inachevé en production en le cachant derrière un interrupteur, sans branches qui s’accumulent.', ex: 'Le nouveau tableau de bord est en production mais invisible tant que l’interrupteur reste fermé.' },
    { name: 'Pipelines MLOps de bout en bout', family: 'stocks', def: 'Chaque expérimentation prometteuse peut être poussée rapidement en production : un modèle non déployé est un stock.', ex: 'Le modèle validé lundi est en production mercredi au lieu de dormir dans un notebook.' },
    { name: 'Catalogues de données et de fonctionnalités', family: 'stocks', def: 'Des répertoires pour rendre les jeux de données et les variables préparées découvrables et réutilisables.', ex: 'Une autre faculté retrouve et réutilise le jeu de données déjà nettoyé par l’équipe voisine.' },
    // Mouvements
    { name: 'Environnement de travail optimisé et outils intégrés (IDE)', family: 'mouvements', def: 'Fournir des postes performants et des outils intégrés.', ex: 'Le développeur code, teste et déploie depuis le même IDE au lieu de jongler entre quatre outils.' },
    { name: 'Blocs de temps dédiés (Focus Time)', family: 'mouvements', def: 'Protéger les développeurs des interruptions avec des périodes sans réunion.', ex: 'Les mardis et jeudis matin sont réservés au développement : aucune réunion n’y est planifiée.' },
    { name: 'Gestion visuelle des priorités (tableau Kanban ou Scrum)', family: 'mouvements', def: 'Avoir une vision claire des priorités pour éviter de jongler entre les tâches.', ex: 'Chacun voit sur le tableau la seule tâche prioritaire du jour au lieu de passer d’un dossier à l’autre.' },
    { name: 'Plateformes de data science intégrées (notebooks)', family: 'mouvements', def: 'Des environnements (JupyterLab, Colab) qui regroupent exploration, modélisation et visualisation pour limiter le changement d’outils.', ex: 'Le data scientist explore, entraîne et trace ses graphiques dans le même notebook.' },
    { name: 'AutoML : recherche automatique des hyperparamètres', family: 'mouvements', def: 'Laisser des algorithmes optimiser les paramètres du modèle, ce qui libère l’expert d’une tâche manuelle répétitive.', ex: 'L’outil teste seul 200 combinaisons de paramètres pendant la nuit.' },
    // Défauts
    { name: 'Développement piloté par les tests (TDD)', family: 'defauts', def: 'Écrire les tests avant le code pour garantir la qualité dès le départ.', ex: 'Le développeur écrit d’abord le test « le calcul des frais refuse un montant négatif », puis le code.' },
    { name: 'Automatisation des tests dans le pipeline CI/CD', family: 'defauts', def: 'Tests unitaires, d’intégration et fonctionnels dans le pipeline pour une détection précoce.', ex: 'Chaque modification lance 500 tests automatiques avant de pouvoir être fusionnée.' },
    { name: 'Analyse de la cause racine', family: 'defauts', def: 'Pour chaque défaut, comprendre pourquoi il est arrivé et améliorer le processus pour qu’il ne revienne pas.', ex: 'Après une panne du VPN, un 5 Pourquoi révèle un certificat expiré ; on automatise son renouvellement.' },
    { name: 'Détection et mitigation des biais', family: 'defauts', def: 'Outils et audits pour analyser les données et les modèles et détecter les biais avant le déploiement.', ex: 'Un audit vérifie que le modèle d’admission ne défavorise pas les candidats d’une région.' },
    { name: 'Surveillance de la performance des modèles (dérive)', family: 'defauts', def: 'Des alertes automatisées pour détecter la dérive des modèles (model drift) et des données (data drift).', ex: 'Une alerte se déclenche quand la précision du modèle de tri des tickets passe sous 85 %.' },
    { name: 'Humain dans la boucle (Human-in-the-Loop)', family: 'defauts', def: 'Pour les décisions critiques, l’IA suggère mais un expert humain valide.', ex: 'L’IA propose une réponse au ticket, mais l’agent la relit avant de l’envoyer.' },
    // Compétences
    { name: 'Management participatif (Kaizen)', family: 'competences', def: 'Impliquer les équipes dans les décisions d’amélioration des processus.', ex: 'Chaque mois, les agents choisissent eux-mêmes une amélioration du processus de soutien à tester.' },
    { name: 'Formation continue et mentorat', family: 'competences', def: 'Investir dans le développement des compétences.', ex: 'Un technicien junior est jumelé à un senior et suit une formation infonuagique payée par l’employeur.' },
    { name: 'Délégation et autonomisation', family: 'competences', def: 'Faire confiance aux équipes pour résoudre les problèmes, sans micro-management.', ex: 'L’équipe de soutien choisit elle-même comment réorganiser sa file de tickets.' },
    { name: 'IA d’augmentation plutôt que de remplacement', family: 'competences', def: 'L’IA gère les données, l’humain garde le jugement et la stratégie.', ex: 'L’IA résume l’historique du client ; l’agent décide de la solution à proposer.' },
    { name: '« Citizen Data Scientists » (outils low-code)', family: 'competences', def: 'Donner aux experts métier des outils d’IA simples pour qu’ils exploitent eux-mêmes leurs données.', ex: 'Le registraire bâtit lui-même un tableau de prévision des inscriptions avec un outil sans code.' },
    { name: 'Culture de l’expérimentation', family: 'competences', def: 'Encourager tous les membres de l’équipe à explorer de nouvelles données et de nouveaux modèles, et leur en donner le temps.', ex: 'Chaque employé dispose d’une journée par mois pour tester une idée d’amélioration.' },
  ],
};
