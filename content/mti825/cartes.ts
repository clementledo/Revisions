import type { Card } from '@/lib/types';

// Cartes mémoire MTI825, tirées de la page de révision « Révision MTI825 » (elle-même bâtie sur les diapos des séances 1 à 11).
// ch = id de la partie dans la page.
const raw: [string, string, string][] = [
  // ---------------- Plan de match
  ['plan', "Format de l’examen final MTI825 ?", "2 déc. 2026, 18 h à 21 h, D-3010. Papier, aucune documentation. 40 % de la note."],
  ['plan', "Les 3 questions de l’examen et leur poids ?", "Q1 : cas RDMAIC, 50 % (environ 85 min). Q2 et Q3 : un thème du cours chacune, 25 % (environ 40 min chacune)."],
  ['plan', 'Gabarit de réponse pour Q2 et Q3 ?', "1) Définition en une phrase avec les termes du cours. 2) Mécanisme : étapes, composantes, rôles en liste numérotée. 3) Exemple concret (chiffres, noms). 4) Lien avec un autre thème et une limite."],
  ['plan', 'Ton exemple maître pour l’examen ?', "Formule ÉTS (travail de session) : Lean (attente et non-qualité dans la création des comptes), ITIL (demande de service vs incident), cloud/sécurité (plateformes multiples, Vaultwarden), RDMAIC (tes causes racines)."],
  ['plan', 'Leçon du TP1 pour l’examen ?', "Le TP1 a été échoué sur la posture et la preuve terrain, pas sur le contenu : le correcteur veut la démarche appliquée au cas, pas une récitation."],

  // ---------------- RDMAIC
  ['rdmaic', 'Que signifie RDMAIC ?', 'Reconnaître, Définir, Mesurer, Analyser, Innover (améliorer), Contrôler : un DMAIC (Lean Six Sigma) précédé d’une étape de reconnaissance.'],
  ['rdmaic', 'Reconnaître : question, outils, livrable ?', "Quel problème perçu, pour qui, quels symptômes ? Outils : persona, parties prenantes, observation sur le terrain (gemba), constat de la valeur perdue. Livrable : énoncé du problème, contexte, sponsor."],
  ['rdmaic', 'Définir : question, outils, livrable ?', "Quel périmètre, quel résultat visé ? Outils : objectif SMART, FIPEC (SIPOC). Livrable : cible chiffrée et datée, frontières du processus."],
  ['rdmaic', 'Mesurer : question, outils, livrable ?', "Quelle est l’ampleur réelle aujourd’hui ? Outils : collecte de données, cartographie du processus (temps actif vs attente, lead time), indicateurs de base. Livrable : situation de départ chiffrée (baseline)."],
  ['rdmaic', 'Analyser : question, outils, livrable ?', "Pourquoi le problème existe-t-il ? Outils : Ishikawa (5M), 5 Pourquoi, 8 gaspillages Lean, Pareto. Livrable : causes racines vérifiées par les données."],
  ['rdmaic', 'Innover : question, outils, livrable ?', "Quelles solutions retenir et comment les déployer ? Outils : technique Disney (rêveur, réaliste, critique), Yellow Box, priorisation, Gantt, pilote. Livrable : solutions liées aux causes, plan d’implantation."],
  ['rdmaic', 'Contrôler : question, outils, livrable ?', "Est-ce que ça marche et ça se maintient ? Outils : mesures avant/après vs cible SMART, standardisation, tableau de bord, PDCA, amélioration continue ITIL. Livrable : résultats, bilan, plan de suivi."],
  ['rdmaic', 'Que veut dire FIPEC (SIPOC) ?', 'Fournisseurs, Intrants, Processus, Extrants, Clients.'],
  ['rdmaic', 'Les 5M d’Ishikawa ?', 'Méthode, Matériel, Matière, Milieu, Main-d’œuvre.'],
  ['rdmaic', 'Objectif SMART : les 5 lettres et le modèle de phrase ?', "Spécifique, Mesurable (valeur de départ et cible), Atteignable, Réaliste/pertinent, Temporel (une date). « Réduire X de A à B d’ici la date, mesuré par Y. »"],
  ['rdmaic', 'Comment cartographier pour mesurer ?', "Étapes en couloirs (swimlane) par acteur, temps actif et temps d’attente par étape, lead time = demande → livraison, repérer les 8 gaspillages sur la carte."],
  ['rdmaic', 'Ishikawa ou 5 Pourquoi ?', "Ishikawa pour ratisser large, 5 Pourquoi pour creuser une branche. Une cause racine est actionnable et se vérifie par une donnée."],
  ['rdmaic', 'Règle entre solutions et causes ?', 'Chaque solution doit viser au moins une cause racine.'],
  ['rdmaic', 'Lien RDMAIC, amélioration continue ITIL et PDCA ?', "RDMAIC est la démarche de projet ; l’amélioration continue ITIL en est le cadre permanent (Contrôler alimente le cycle suivant) ; PDCA (planifier, faire, vérifier, agir) pilote chaque amélioration."],
  ['rdmaic', 'Les 3 rôles de la technique Disney ?', 'Rêveur, réaliste, critique.'],
  ['rdmaic', 'Pièges d’examen sur RDMAIC ?', "Solutions sans mesure ni causes racines ; objectif sans valeur de départ ni date ; ne pas citer les chiffres du cas à chaque phase ; négliger Contrôler (indicateur + propriétaire) ; ignorer le changement humain (formation, résistance)."],

  // ---------------- Gouvernance
  ['gouv', 'Définition d’un service (ITIL 4) ?', 'Un moyen de permettre la co-création de valeur.'],
  ['gouv', 'Valeur = ? + ?', "Utilité (ce que ça fait, la fonctionnalité) + garantie (disponibilité, capacité, continuité, sécurité : « ça marche de façon fiable »)."],
  ['gouv', 'Co-création de valeur ?', 'Le fournisseur (ex. le département TI) et le consommateur (ex. l’équipe de vente) créent la valeur ensemble.'],
  ['gouv', 'Définition d’un produit (ITIL 4) ?', 'Une configuration de ressources offerte à un consommateur.'],
  ['gouv', 'Gouvernance vs gestion ?', "Gouvernance : évaluer, diriger, surveiller ; le conseil fixe la direction et les règles (ISO/IEC 38500, COBIT). Gestion : planifier, bâtir, exploiter, mesurer pour exécuter (ITIL, ISO 20000, projets)."],
  ['gouv', 'Exemple gouvernance vs gestion ?', "Le conseil d’administration exige un taux de disponibilité du portail (gouvernance) ; le gestionnaire TI met en place la surveillance et les changements (gestion)."],
  ['gouv', 'À quoi servent COBIT 2019 et ISO/IEC 38500 ?', "COBIT 2019 : gouvernance et gestion des TI de l’entreprise. ISO/IEC 38500 : principes de gouvernance des TI pour les dirigeants."],
  ['gouv', 'ITIL v4 vs ISO/IEC 20000 ?', 'Les deux portent sur la gestion des services TI : ITIL donne les pratiques, ISO 20000 est la norme certifiable.'],
  ['gouv', 'ISO 31000, ISO/IEC 27000, BABOK ?', 'ISO 31000 : gestion des risques. ISO/IEC 27000 : sécurité de l’information. BABOK : analyse d’affaires (exigences).'],
  ['gouv', 'TOGAF, PRINCE2/PMBOK, CMMI ?', 'TOGAF : architecture d’entreprise (méthode ADM). PRINCE2 et PMBOK : gestion de projets. CMMI : maturité des processus.'],
  ['gouv', 'DevOps, MLOps, AIOps ?', 'DevOps : collaboration Dev/Ops. MLOps : apprentissage machine en production. AIOps : IA appliquée aux opérations.'],
  ['gouv', 'Pièges d’examen sur les cadres ?', "Confondre cadre (ITIL, TOGAF), norme certifiable (ISO 20000, ISO 27001) et méthode (Scrum, DMAIC) ; réduire la valeur à la fonctionnalité ; parler de « bonnes pratiques » sans dire quel problème elles règlent."],

  // ---------------- Lean
  ['lean', 'Les 4P des 14 principes du Toyota Way ?', 'Philosophie (1), Processus (2 à 8), Personnel et partenaires (9 à 11), Résolution de problèmes (12 à 14).'],
  ['lean', 'Principes « Processus » du Toyota Way (2 à 8) ?', 'Flux continu, système tiré, niveler la charge, arrêter pour corriger (qualité du premier coup), standardiser, contrôle visuel, technologies éprouvées.'],
  ['lean', 'Principes « Résolution de problèmes » (12 à 14) ?', 'Aller voir sur place (genchi genbutsu), décider par consensus et agir vite, apprendre en continu (kaizen).'],
  ['lean', 'Juste-à-temps ?', 'Produire ce qu’il faut, quand il faut.'],
  ['lean', 'Flux poussé vs flux tiré ?', 'Poussé : selon les prévisions. Tiré : selon la demande réelle (ex. Kanban).'],
  ['lean', 'Takt time vs lead time ?', 'Takt time : rythme imposé par la demande client (temps disponible ÷ demande). Lead time : temps total entre la demande et la livraison.'],
  ['lean', 'Les 7 + 1 gaspillages ?', '1 Surproduction, 2 Attente, 3 Transport, 4 Traitements inutiles, 5 Stocks, 6 Mouvements, 7 Défauts, +1 Sous-utilisation des compétences.'],
  ['lean', 'Surproduction en TI classique et à l’ère de l’IA ?', 'TI : fonctionnalités non demandées (« gold plating »). IA : modèles trop complexes, IA « pour la tendance ».'],
  ['lean', 'Attente en TI classique et à l’ère de l’IA ?', 'TI : validation, comité, fenêtre de déploiement. IA : accès aux données, entraînement d’un modèle.'],
  ['lean', 'Transport en TI classique et à l’ère de l’IA ?', 'TI : transferts entre silos (analyste → dév → QA). IA : pipelines de données fragiles, passation de modèles entre équipes.'],
  ['lean', 'Traitements inutiles en TI et IA ?', 'TI : documentation que personne ne lit, sur-ingénierie. IA : sur-nettoyage des données, réentraînement manuel.'],
  ['lean', 'Stocks en TI et IA ?', 'TI : travail en cours non fusionné ou non testé. IA : modèles entraînés jamais déployés, jeux de données non utilisés.'],
  ['lean', 'Mouvements en TI et IA ?', 'TI : changements de contexte, réunions inutiles. IA : charge cognitive entre plusieurs outils.'],
  ['lean', 'Défauts en TI et IA ?', 'TI : bugs en production, reprises, dette technique. IA : biais, hallucinations, dérive de modèle.'],
  ['lean', 'Sous-utilisation des compétences (+1) ?', 'TI : experts sur des tâches subalternes, suggestions ignorées. IA : experts réduits à l’étiquetage.'],
  ['lean', 'Moyens de réduire la surproduction ?', 'Développement itératif, MVP, YAGNI ; version IA : preuve de valeur avant de construire, modèle de base simple.'],
  ['lean', 'Moyens de réduire l’attente ?', 'CI/CD, limites de travail en cours (WIP), équipes autonomes ; version IA : DataOps, MLOps, ressources élastiques.'],
  ['lean', 'Pièges d’examen sur Lean ?', "Réciter les 8 sans les placer dans un processus précis ; confondre takt time et lead time ; oublier le « +1 » (sous-utilisation du potentiel des employés)."],

  // ---------------- ITIL
  ['itil', 'Les 3 familles de pratiques ITIL 4 ?', 'Générales, gestion des services TI, techniques.'],
  ['itil', 'Pratiques techniques ITIL 4 ?', 'Déploiement, infrastructure et plateformes, développement logiciel.'],
  ['itil', 'Exemples de pratiques générales ITIL 4 ?', 'Amélioration continue, mesures et rapport, relations, connaissances, stratégie, finances, architecture, portefeuille, projets, changements organisationnels, compétences, risques, sécurité, fournisseurs.'],
  ['itil', 'Incident : définition et but ?', 'Interruption non prévue ou baisse de qualité. But : restaurer vite. Incident majeur : procédure distincte, délais plus courts.'],
  ['itil', 'Problème : définition et phases ?', "Cause sous-jacente inconnue d’un ou plusieurs incidents. Phases : identification, contrôle des problèmes, contrôle des erreurs."],
  ['itil', 'Solution de contournement vs erreur connue ?', 'Contournement : réduit l’impact sans corriger la cause. Erreur connue : problème avec cause documentée et contournement.'],
  ['itil', 'Changement : définition et but ?', 'Modification d’infrastructure, applications, documentation ou processus. But : équilibrer valeur et risque.'],
  ['itil', 'Les 3 types de changement ?', 'Standard : pré-approuvé, peu risqué, connu, idéalement automatisé. Normal : analysé et priorisé (majeur → CAB). Urgent : ECAB, pour un correctif d’incident.'],
  ['itil', 'CAB, ECAB, PIR ?', 'CAB : comité consultatif des changements. ECAB : son équivalent pour les changements urgents. PIR : revue post-implantation, en fin de cycle.'],
  ['itil', 'Les 6 étapes de l’amélioration continue ITIL ?', '1 La vision. 2 Où sommes-nous ? 3 Où voulons-nous aller ? 4 Comment y parvenir ? 5 Passer à l’action. 6 Conserver l’élan.'],
  ['itil', 'Activités de l’amélioration continue ?', 'Budget, registre des améliorations, priorisation par SWOT, étude coûts/bénéfices, PDCA.'],
  ['itil', 'Catalogue de services ?', 'Source unique d’information sur les services offerts.'],
  ['itil', 'Niveaux de service ?', 'Des objectifs clairs et mesurés (SLA).'],
  ['itil', 'CI et CMS ?', 'Un CI (élément de configuration) est un composant à gérer ; le CMS stocke les CI et leurs liens.'],
  ['itil', 'Pratique Continuité ?', 'BIA, plans de reprise, tests.'],
  ['itil', 'Pièges d’examen sur ITIL ?', "Un problème n’est pas « un incident grave » ; un contournement n’est pas une résolution ; les changements standards sont pré-approuvés ; ITIL n’est pas un processus rigide (en agile, les changements font partie de la collaboration avec le client)."],
  ['itil', 'Exemple ITIL tiré de Formule ÉTS ?', 'Demande de service (compte Gmail, AD, GitLab, Vaultwarden, 3DEXPERIENCE) vs incident ; absence de date d’acceptation enregistrée.'],

  // ---------------- Agilité
  ['agile', 'Manifeste agile : quand et par qui ?', 'Février 2001, par 17 spécialistes indépendants. 4 valeurs et 12 principes.'],
  ['agile', 'Les 4 valeurs du manifeste agile ?', "On valorise davantage : les individus et leurs interactions (que processus et outils) ; un logiciel opérationnel (que documentation exhaustive) ; la collaboration avec le client (que négociation contractuelle) ; la réaction au changement (que le suivi d’un plan)."],
  ['agile', 'Les 3 rôles Scrum ?', 'Product Owner (valeur, priorités), équipe de développement (autogérée), Scrum Master (facilite).'],
  ['agile', 'Les 5 événements Scrum ?', 'Sprint (conteneur), Sprint Planning, Daily Scrum, Sprint Review (démonstration), Sprint Retrospective (amélioration).'],
  ['agile', 'Les 3 artefacts Scrum ?', 'Product Backlog, Sprint Backlog, Incrément.'],
  ['agile', 'Kanban et XP ?', 'Kanban : visualiser le flux, limiter le travail en cours. XP : pratiques techniques (tests, programmation en paire, intégration continue).'],
  ['agile', 'Agilité à grande échelle ?', 'Scrum de Scrums (plus de neuf personnes à coordonner), SAFe, LeSS, Nexus, modèle Spotify (équipes autonomes, tribus, guildes).'],
  ['agile', '« Gouverner vers la valeur » ?', 'La gouvernance agile fixe la direction, les équipes décident du comment.'],
  ['agile', 'Prédictif vs agile ?', 'Prédictif : portée fixée tôt, plan détaillé, livraison à la fin. Agile : portée qui évolue, livraisons fréquentes, rétroaction du client. On choisit selon la stabilité des besoins et le risque.'],
  ['agile', 'Pièges d’examen sur l’agilité ?', "« Agile = pas de documentation, pas de plan » (le manifeste valorise davantage, il n’exclut pas) ; le Scrum Master n’est pas un chef de projet ; ne pas oublier Sprint Review et rétrospective."],

  // ---------------- DevOps
  ['devops', 'Pourquoi DevOps ?', "L’éloignement entre développement (changer vite) et opérations (stabilité) freine le time to market."],
  ['devops', 'DevOps est-il un cadre, un outil ou une organisation ?', "Aucun des trois : c’est l’intégration systématique de l’Agilité, du Lean, de la livraison continue et du Toyota Kata."],
  ['devops', 'CALMS ?', 'Culture (responsabilité partagée), Automation, Lean (flux de valeur visible), Measurement (hypothèses, validation, apprentissage), Sharing (partager responsabilités et succès).'],
  ['devops', 'Les trois voies DevOps ?', '1 Flux (du développement à la production). 2 Rétroaction (boucles courtes, de la production vers le développement). 3 Apprentissage continu (l’échec comme occasion d’apprendre).'],
  ['devops', 'Intégration continue ?', 'Le travail de chaque équipe est intégré et validé en continu, ce qui réduit les risques.'],
  ['devops', 'Livraison continue vs déploiement continu ?', 'Livraison continue : prêt à déployer. Déploiement continu : déployé automatiquement en test et en production.'],
  ['devops', 'Pipeline de livraison et DevSecOps ?', 'Pipeline : étapes automatisées du développement à la production. DevSecOps : la sécurité dès le pipeline.'],
  ['devops', 'Pièges d’examen sur DevOps ?', "Réduire DevOps à des outils (la culture d’abord) ; confondre livraison et déploiement continus ; oublier le lien avec ITIL (changements standards automatisés et pré-approuvés)."],

  // ---------------- Architecture
  ['archi', 'Rôle de l’architecture d’entreprise ?', 'Traduire la stratégie d’affaires en exécution technologique cohérente : construire la bonne chose, de la bonne façon.'],
  ['archi', 'Les 4 principes de l’architecture d’entreprise ?', 'Alignement stratégique (relier le « pourquoi » au « comment »), vision à long terme (éviter silos, redondance, dette technique), gouvernance (cadre qui donne de l’autonomie), évolution intentionnelle.'],
  ['archi', 'Qu’est-ce que l’ADM de TOGAF ?', 'Architecture Development Method : un cycle itératif et adaptable.'],
  ['archi', 'Responsabilités de l’architecte (TOGAF) ?', 'Vision d’architecture ; piloter l’ADM (affaires, données, applications, technologie) ; gouverner la mise en œuvre (contrats d’architecture, revues de conformité) ; gérer le changement.'],
  ['archi', 'TOGAF vs ArchiMate ?', 'TOGAF donne la méthode, ArchiMate la notation (langage de modélisation).'],
  ['archi', 'Éléments de la couche Motivation (ArchiMate) ?', 'Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint, Meaning, Value.'],
  ['archi', 'Éléments de la couche Stratégie (ArchiMate) ?', 'Course of action, Capability, Resource.'],
  ['archi', 'Chaîne logique ArchiMate ?', 'Driver → Assessment → Goal → Outcome (mesurable) → Principle → Requirement (sous Constraint) ; puis Course of action ← Capability ← Resource.'],
  ['archi', 'Exemple Hydro-Québec 2035 : Outcome et Course of action ?', 'Outcome : réduire les pannes de 35 %. Course of action : renforcer la pérennité du réseau.'],
  ['archi', 'Outils d’analyse du cas Banque Boréale ?', 'Principes d’architecture (atelier 1), FFOM / SWOT (atelier 2), SMART pour les objectifs (atelier 3).'],
  ['archi', 'Pièges d’examen sur l’architecture ?', "Confondre TOGAF (méthode) et ArchiMate (langage) ; un Outcome sans mesure ; faire de l’architecture un document figé (l’ADM est itératif)."],

  // ---------------- Infonuagique
  ['cloud', 'IaaS, PaaS, SaaS ?', 'IaaS : infrastructure (machines virtuelles, réseau, stockage). PaaS : plateforme pour développer et déployer. SaaS : application complète consommée en service.'],
  ['cloud', 'CaaS et FaaS ?', 'CaaS : conteneurs. FaaS / serverless : fonctions déclenchées par des événements, facturées à l’usage.'],
  ['cloud', 'Plus on monte de IaaS vers SaaS… ?', 'Moins on gère, plus on dépend du fournisseur.'],
  ['cloud', 'Ce qui a changé de 2018 à 2025 ?', 'Le cloud est passé d’une transition à justifier à la norme à gérer : création de valeur, gestion des risques, contrôle des coûts.'],
  ['cloud', 'Les 5 étapes de la marche à suivre cloud ?', '1 Apprendre, 2 Planifier, 3 Officialiser, 4 Gérer, 5 Développer.'],
  ['cloud', 'Étape « Gérer » en 2025 ?', 'Gouvernance : FinOps (coûts attribués aux unités d’affaires) et SecOps (Zero Trust).'],
  ['cloud', 'Shadow AI ?', 'Des données sensibles envoyées à des API publiques d’IA, avec des enjeux de Loi 25.'],
  ['cloud', 'Les 3 vrais pièges du cloud en 2025 ?', 'Choc FinOps (le paiement à l’usage sans gouvernance) ; risque systémique (dépendance au fournisseur, ex. panne AWS, CrowdStrike) ; conflit de souveraineté (Loi 25 vs CLOUD Act → nuage souverain).'],
  ['cloud', 'Chiffres Deloitte 2023 (Canada) ?', '81 % des leaders optimistes face à l’IA générative ; 91 % voient les nuages sectoriels comme un accélérateur ; 50 % citent la pénurie de main-d’œuvre comme obstacle majeur.'],
  ['cloud', 'Responsabilité partagée dans le cloud ?', 'Le fournisseur sécurise l’infrastructure ; toi, les données, les accès et la configuration.'],
  ['cloud', 'Pièges d’examen sur le cloud ?', "Présenter le cloud comme une économie automatique (sans FinOps, le coût dérive) ; ignorer la responsabilité partagée ; parler de « sécurité » sans nommer le risque précis."],

  // ---------------- Impartition
  ['impart', 'Les 4 façons de fournir un service ?', 'Insourcing (à l’interne), outsourcing (à l’externe, en substitution), partenariat (source unique, relation et intégration plus fortes), multi-sourcing (plusieurs sources).'],
  ['impart', 'Pratique « Fournisseurs » (ITIL) ?', 'Optimiser ressources et contrats, aligner les contrats sur les besoins d’affaires, gérer relations et performance, négocier et gérer le cycle de vie des contrats, maintenir une base fournisseurs et contrats.'],
  ['impart', 'Quoi garder à l’interne, quoi externaliser ?', 'Cœur de métier / différenciant : à l’interne. Commodité (courriel, paie) : à l’externe.'],
  ['impart', 'Critères de choix d’un mode de sourcing ?', 'Coût total, risque, compétences, dépendance, conformité (lieu des données), capacité de sortie.'],
  ['impart', 'Les 7 étapes de la Cyber Kill Chain ?', '1 Reconnaissance, 2 Armement, 3 Livraison, 4 Exploitation, 5 Installation, 6 Commande et contrôle, 7 Actions sur les objectifs.'],
  ['impart', 'Idée clé de la Cyber Kill Chain ?', 'Plus tôt on interrompt la chaîne, moins le dommage est grand (défense en profondeur).'],
  ['impart', 'DevSecOps ?', 'Intégrer la sécurité dans le pipeline (analyse de code, de dépendances, de conteneurs) plutôt qu’à la fin.'],
  ['impart', 'Normes derrière les pratiques ITIL « Sécurité » et « Risques » ?', 'Sécurité de l’information : ISO/IEC 27000. Risques : ISO 31000.'],
  ['impart', 'Zero Trust ?', 'Ne jamais faire confiance par défaut, vérifier continuellement.'],
  ['impart', 'Pièges d’examen sur l’impartition ?', "Croire qu’on externalise la responsabilité (l’organisation reste responsable de ses données et clients) ; ne pas prévoir la sortie du contrat (réversibilité) ; réciter la Kill Chain sans contre-mesure par étape."],
];

// Identifiant stable tiré du texte de la question (garde la progression si l'ordre change).
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export const cards: Card[] = raw.map(([ch, q, a]) => ({ id: `mti825-${hash(q)}`, ch, q, a }));
