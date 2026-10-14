import type { Card } from '@/lib/types';

// Cartes mémoire MGL805, tirées de la page de révision « Fiches examen final MGL805 » (elle-même basée sur les slides).
// ch = id de la partie dans la page. ★ = sujet signalé par le prof.
const raw: [string, string, string][] = [
  // ---------------- 25·1 IA privée
  ['iapriv', "Qu'est-ce que le Shadow AI ?", "L'usage par les employés d'outils d'IA non approuvés : 41 % des employés (LayerX). Il ajoute ~670 000 $ au coût d'une violation de données (IBM, 2025)."],
  ['iapriv', 'Téléverser des renseignements personnels dans un chatbot, selon la CAI ?', "C'est une communication de renseignements au sens de la Loi 25 (CAI, 2025)."],
  ['iapriv', 'Loi 25 : article 17, EFVP, sanctions ?', "Art. 17 : tout transfert hors Québec exige une protection équivalente. EFVP (évaluation des facteurs relatifs à la vie privée) obligatoire avant tout projet d'IA. Sanctions jusqu'à 25 M$ ou 4 % du chiffre d'affaires mondial."],
  ['iapriv', 'Pourquoi le CLOUD Act pose problème ?', 'Les données confiées à un fournisseur américain restent accessibles au gouvernement des États-Unis.'],
  ['iapriv', "Les 4 paliers du spectre d'options d'IA ?", "1) Grand public (à proscrire pour le sensible). 2) Offres entreprise (non-entraînement contractuel, opt-out API, chiffrement). 3) Hébergement souverain (données au Québec). 4) IA privée auto-hébergée (contrôle maximal)."],
  ['iapriv', "Qu'achète surtout une offre « entreprise » ?", "Un engagement contractuel de non-entraînement sur vos données."],
  ['iapriv', 'Open source ou paramètres ouverts ?', "Open source : poids + code + recettes d'entraînement, reproductible. Paramètres ouverts : seulement les poids. Tout open source est à paramètres ouverts ; l'inverse est faux."],
  ['iapriv', 'Licences de modèles : lesquelles sont permissives ?', "Apache 2.0 et MIT. Les licences « communautaires » (ex. Llama) imposent des restrictions. On choisit le modèle par licence d'abord, puis par tâche."],
  ['iapriv', 'VRAM pour un modèle de 70 B en FP16 ?', '70 × 10⁹ × 2 octets = ~140 Go. ~70 Go en 8 bits, ~35 Go en 4 bits.'],
  ['iapriv', "Avantages et inconvénients d'une IA privée ?", "+ souveraineté (art. 17), contrôle, qualité à ~6-9 mois des modèles fermés, coûts prévisibles à fort volume. − léger retard de capacité, infrastructure lourde, plus cher qu'une API à faible volume, responsabilité interne (sécurité, biais, hallucinations)."],
  ['iapriv', 'RAG : principe et composants ?', "Récupérer des passages de vos documents et les fournir au modèle, sans réentraînement. Composants : embeddings, index vectoriel, reranker, générateur. La qualité de la récupération prime souvent sur la taille du modèle."],
  ['iapriv', 'Quand faire du fine-tuning ?', 'Seulement si le RAG ne suffit pas.'],
  ['iapriv', "Les 4 étapes pour mettre en œuvre une IA privée d'AQL ?", "Cadrer (cartographier les données, EFVP) · Choisir (licence d'abord) · Déployer (Ollama en dev, vLLM sur Kubernetes en prod) · Encadrer (DLP, journalisation, évaluation privée, gouvernance, humain dans la boucle)."],
  ['iapriv', 'Recommandation finale du cours sur IA publique / privée ?', "Penser en spectre ; modèle hybride : petit modèle privé pour le sensible, API pour le reste. Le choix dépend de la sensibilité des données, pas d'un dogme."],

  // ---------------- 25·2 Exigences
  ['exig', 'Exigence fonctionnelle vs non fonctionnelle ?', "Fonctionnelle : ce que le produit doit accomplir. Non fonctionnelle (ENF) : comment il le fait ; synonyme : contraintes de conception (ISO 24765)."],
  ['exig', 'Où trouver les besoins du client ?', "Appel d'offres (RFP), cahier des charges (SOW), concept d'opération (CONOPS) ou document de vision, spécification du système."],
  ['exig', 'Définition du modèle de la qualité (ISO 25000) ?', "Ensemble défini de caractéristiques et de relations entre elles, qui fournit un cadre pour spécifier les exigences de qualité et évaluer la qualité (donc la mesurer)."],
  ['exig', 'Qualité interne vs externe : exemple du cours ?', "Maintenabilité. Interne : testabilité = nombre de chemins du graphe de contrôle (V(G)), sur le code, sans exécution. Externe : analysabilité = effort pour trouver la cause d'une défaillance, en exécution."],
  ['exig', 'IEEE 1061 : rôle et structure ?', "Premier modèle normalisé (1998) : un cadre de mesure, qui donne des exemples de mesures sans en prescrire. Hiérarchie : qualité → facteurs (mesures directes) → sous-facteurs → mesures."],
  ['exig', 'Formule de disponibilité (IEEE 1061) ?', 'A = heures disponibles / (heures disponibles + heures non disponibles). Ex. 37,5 / (37,5 + 2) = 94,9 % < 95 %. Toujours donner un exemple de calcul dans la spécification.'],
  ['exig', 'Que signifie SQuaRE ?', 'Systems and software Quality Requirements and Evaluation (famille ISO 25000), relève d’ISO 9126 (1991, peu utilisée).'],
  ['exig', 'Les 5 divisions de la famille ISO 25000 ?', '2500n gestion · 2501n modèle (25010) · 2502n mesure · 2503n exigences · 2504n évaluation.'],
  ['exig', 'Les 4 étapes préconisées par ISO 25000 ?', 'Fixer les exigences de qualité · établir un modèle de qualité · fixer les mesures · conduire les évaluations.'],
  ['exig', 'Les 3 modèles sous ISO 25000 ?', 'Qualité de fonctionnement (quality in use), qualité du produit (8 caractéristiques), qualité des données.'],
  ['exig', 'Les 5 caractéristiques de la qualité de fonctionnement ?', "Efficacité · efficience · satisfaction · mitigation des risques de sûreté de fonctionnement · couverture contextuelle."],
  ['exig', 'Efficacité ou efficience ?', "Efficacité : atteindre le but (exactitude, exhaustivité). Efficience : l'atteindre avec peu de ressources. Finir en 40 min au lieu de 5 : efficace, pas efficient."],
  ['exig', 'Les 8 caractéristiques de qualité du produit (ISO 25010) ?', "Aptitude fonctionnelle · efficacité du rendement · compatibilité · facilité d'utilisation · fiabilité · sécurité · maintenabilité · portabilité. « Avec Elle, Charles Fait Fortune Sans Même Payer »."],
  ['exig', 'Sous-caractéristiques de la fiabilité ?', 'Maturité · disponibilité · tolérance aux pannes · rétablissement.'],
  ['exig', 'Sous-caractéristiques de la sécurité ?', 'Confidentialité · intégrité · non-réfutation · responsabilisation · authenticité.'],
  ['exig', 'Sous-caractéristiques de la maintenabilité ?', 'Modularité · réutilisabilité · analysabilité · modifiabilité · testabilité.'],
  ['exig', 'Sous-caractéristiques de la portabilité et de la compatibilité ?', 'Portabilité : adaptabilité, installabilité, remplaçabilité. Compatibilité : coexistence, interopérabilité.'],
  ['exig', 'Tableau 3.6 : ce qu’il faut retenir ?', "Ajouter des fonctionnalités nuit à l'efficacité, la fiabilité, la sécurité et la maintenabilité. La sécurité nuit au rendement et à l'utilisabilité. Le rendement nuit à presque tout. La maintenabilité aide fiabilité et sécurité."],
  ['exig', 'Figure 3.8 : les 5 étapes pour définir les ENF ?', "Identifier les parties prenantes · développer le questionnaire · faire les entrevues (par sous-ensembles) · consolider et prioriser · faire autoriser les caractéristiques qualité."],

  // ---------------- 25·3 Sécurité IAG
  ['iag', "Les 4 surfaces d'attaque de l'IAG ?", "A. Ce que le modèle écrit · B. Ce que le modèle lit · C. Ce que l'outil fait · D. Ce que l'humain ne fait plus. Le contrôle doit être placé dans la bonne surface : la revue humaine ne corrige ni B ni D."],
  ['iag', 'Sécurité du code généré : les chiffres ?', "Compile ~100 % du temps, mais ~44 % des fonctions introduisent une vulnérabilité connue (réussite 56 %, stagnation : 55 % au premier rapport ; Veracode 2026)."],
  ['iag', 'Quels risques IAG sont réellement nouveaux ?', "4 sur 10 : nº 2 paquet halluciné / slopsquatting, nº 3 injection indirecte par le dépôt, nº 5 agents sur-privilégiés, nº 6 chaîne d'approvisionnement de l'outillage IA. Les 6 autres sont amplifiés."],
  ['iag', 'Pourquoi le risque nº 9 est « le multiplicateur » ?', "L'écart de vérification et le biais d'automatisation dégradent le contrôle humain qui aurait attrapé les 9 autres risques."],
  ['iag', "L'erreur à éviter entre risques nouveaux et amplifiés ?", "Négliger le nº 7 (contrôle d'accès défaillant) : 1re vulnérabilité OWASP, la plus fréquente dans le code généré, et c'est de la logique métier, mal détectée par l'analyse automatisée."],
  ['iag', 'La phrase à retenir sur les contrôles ?', "Chaque contrôle doit être mécanique : s'il repose sur la vigilance, ce n'est pas un contrôle, c'est une recommandation."],
  ['iag', "Injection par les fichiers d'instructions ?", "Caractères Unicode invisibles insérés dans .cursorrules, CLAUDE.md ou copilot-instructions.md (surface B). Contrôle : traiter ces fichiers comme de la configuration de déploiement, refuser tout caractère non imprimable en IC."],
  ['iag', "Qu'est-ce qu'une AIBOM ?", "La nomenclature des agents, outils et serveurs MCP, avec une liste d'outils autorisés. Question d'audit : « Quels serveurs MCP sont actifs sur les postes de vos développeurs ? »"],
  ['iag', "Qu'est-ce que le slopsquatting ?", "Une variante du typosquatting déclenchée par une hallucination : le LLM suggère un paquet inexistant (19,7 % des suggestions), toujours le même, qu'un attaquant enregistre."],
  ['iag', "L'attaque du paquet halluciné en 3 temps ?", "1) L'IAG suggère un faux paquet plausible (jwt_validator_utils). 2) L'attaquant le publie (minutes, 0 $). 3) Un hook PostInstall s'exécute avant le premier import, avec les droits du développeur ou du runner d'IC."],
  ['iag', 'Les 5 contre-mesures par ordre d’efficacité ?', "Miroir de registre avec quarantaine · verrouillage (lock + sommes de contrôle) · SCA en porte d'IC · installation sans exécution · règle de revue (vérifier sur le registre officiel)."],
  ['iag', 'Les 6 politiques de quarantaine d’un miroir ?', "Âge de publication (7 à 30 j) · vulnérabilités (CVE/CWE) · réputation · licence · comportement (hook, obfuscation, réseau) · provenance (Sigstore, SLSA)."],
  ['iag', 'Limites du miroir de registre ?', "Un paquet légitime compromis après approbation passe ; pip --index-url pypi.org contourne tout (bloquer au pare-feu) ; quelqu'un doit traiter les refus."],
  ['iag', 'Épinglage de version vs verrouillage cryptographique ?', "requests==2.32.3 garantit la reproductibilité (contrôle de qualité). + --hash=sha256 garantit l'intégrité : toute substitution fait échouer l'installation (contrôle de sécurité)."],
  ['iag', 'Contre quoi le verrouillage ne protège pas ?', "Un paquet déjà malveillant au moment du verrouillage (le verrou fige le mal) et une vulnérabilité découverte après coup. Contrepoids : Dependabot/Renovate + SCA."],
  ['iag', 'npm install ou npm ci sur un runner ?', "npm ci : exige le lock, l'applique à la lettre, échoue s'il diverge (+ --ignore-scripts pour couper les hooks). npm install peut modifier package-lock.json."],
  ['iag', 'SCA : capacités A et B ?', "A : appariement de vulnérabilités (CVE) — inefficace contre un nom halluciné. B : détection de paquets malveillants (comportement, métadonnées) — efficace, mais après l'installation."],
  ['iag', 'Contrôles les plus efficaces contre le nom halluciné ?', "Détection d'import non déclaré (deptry), quarantaine du miroir (âge, réputation), vérification d'existence sur la nomenclature (SBOM)."],
  ['iag', "Dissocier l'acquisition de l'exécution : comment ?", "Python : only-binary = :all: (roues seulement, pas de setup.py). npm : ignore-scripts. Maven : JAR inerte mais plugins exécutés à la construction. Limite : la charge passe dans __init__.py (réduction d'impact, pas prévention)."],

  // ---------------- 25·4 Normes ★
  ['normes', '★ Combien de normes en génie logiciel en ce moment ?', 'Entre 120 et 300 : le portefeuille du SC7 est passé de 5 normes (années 1980) à plus de 160 en 2016.'],
  ['normes', 'Définition d’une norme (ISO 24765) ?', "Ensemble d'exigences obligatoires établies par consensus et maintenues par un organisme reconnu, pour prescrire une approche disciplinée et uniforme."],
  ['normes', 'Consensus ISO, adoption, obligation ?', "Consensus = absence d'opposition ferme, pas l'unanimité. Adoption d'une IS : majorité des deux tiers des pays membres participants. L'usage d'une norme ISO est volontaire."],
  ['normes', 'Qui fait les normes du logiciel ?', "ISO et IEC, comité conjoint JTC 1, sous-comité SC 7 (Software and Systems Engineering). WG 24 : très petites entreprises (ISO 29110) ; WG 20 : SWEBOK."],
  ['normes', '★ But du SWEBOK et différence avec les disciplines connexes ?', "Définir le corpus de connaissances du génie logiciel (17 domaines en v4, dont Architecture, Opérations, Sécurité nouveaux). Pour les disciplines connexes, il ne fait que délimiter la frontière et renvoie à leurs propres référentiels."],
  ['normes', '★ PMBOK : 5 groupes de processus ?', 'Démarrage · planification · exécution · surveillance et maîtrise · clôture.'],
  ['normes', '★ PMBOK : les 12 principes ?', "Intendance · équipe · parties prenantes · valeur · pensée systémique · leadership · adaptation · qualité · complexité · risque · adaptabilité et résilience · changement."],
  ['normes', '★ But du BABOK ?', "Corpus de connaissances de l'analyste d'affaires : planifier et suivre les exigences, élicitation, cycle de vie des exigences, analyse stratégique, analyser et concevoir les exigences, évaluer des solutions."],
  ['normes', '★ ISO 12207 : obligations et verbes ?', "Norme la plus importante après le SWEBOK ; utilisée par l'OIQ. « shall » = obligé · « should » = devriez · « could » = pouvez."],
  ['normes', '★ ISO 12207 : les 4 groupes de processus ?', '30 processus : contractuels (2) · organisationnels (6) · de gestion (8, dont risque, configuration, AQL) · techniques (14).'],
  ['normes', 'Adapter ISO 12207 à un projet (tailoring) ?', "Énoncé « full » ou « tailored conformance » au début du plan · documenter les circonstances · consulter les parties · documenter ce qui ne sera pas produit et pourquoi · faire autoriser par l'organisation qualité."],
  ['normes', 'Les 7 principes de management de la qualité (ISO 9001:2015) ?', "Orientation client · leadership · implication du personnel · approche processus · amélioration continue · décision fondée sur des preuves · relations mutuellement bénéfiques avec les fournisseurs."],
  ['normes', 'ISO/IEC 90003 ?', "Lignes directrices pour appliquer ISO 9001 au logiciel (ex. la vérification peut comprendre revues, analyses, démonstrations, prototypes, simulations, tests)."],
  ['normes', 'ITIL, ISO 20000, ISO 27001, COBIT ?', "ITIL : bonnes pratiques de services TI ; ISO 20000 sa norme certifiable. ISO 27001 : exigences du SMSI. COBIT (ISACA) : auditeurs ; EDM (gouvernance) + APO, BAI, DSS, MEA (management)."],
  ['normes', 'DO-178C : niveaux de criticité ?', "5 niveaux A à E. A : perte catastrophique (10⁻⁹/h de vol) · B dangereuse (10⁻⁷) · C majeur (10⁻⁵) · D mineur · E aucun impact."],
  ['normes', 'EN 50716:2023 : à retenir ?', "Ferroviaire, remplace EN 50128/50657. Méthodes formelles aussi pour SIL 1 et 2 ; l'indépendance augmente avec le SIL (à SIL 3-4, la validation ne rapporte plus au chef de projet)."],
  ['normes', 'Capacité d’un processus selon le Prof. Grant ?', "Varie d'une entreprise à l'autre, ne s'achète pas, se construit sur plusieurs années, ne s'obtient pas en accumulant des gabarits, s'impartit difficilement, évolue constamment."],

  // ---------------- CMMI
  ['cmmi', 'Les 5 niveaux de maturité du CMMI et leur focus ?', "1 Initial (—) · 2 Discipliné (gestion de projet) · 3 Ajusté (capitalisation et personnalisation) · 4 Géré quantitativement (gestion quantitative) · 5 En optimisation (optimisation continue)."],
  ['cmmi', 'CMMI V1.3 : domaines du niveau 2 ?', "Gestion des exigences · planification de projet · surveillance et contrôle · gestion des accords fournisseurs · mesure et analyse · assurance qualité processus et produit · gestion de configuration."],
  ['cmmi', 'Effet de la montée en maturité ?', "Risque et reprise diminuent ; qualité et productivité augmentent ; estimés plus précis, écarts réduits."],
  ['cmmi', 'CMMI V2.0 : comment est organisé le modèle ?', "Domaines de pratiques regroupés en capability areas et en 4 catégories (Doing, Managing, Enabling, Improving), avec des pratiques étagées par niveau."],
  ['cmmi', 'Où est la gestion de configuration en CMMI V2.0 ?', "Domaine CM, capability area Supporting Implementation (catégorie Enabling), pratiques de niveaux 1 et 2 seulement."],
  ['cmmi', 'RSK en CMMI V2.0 ?', 'Risk and Opportunity Management : un risque peut aussi être positif.'],
  ['cmmi', 'Lien entre GOV et les politiques ?', "GOV demande à la haute direction de définir les directives organisationnelles (les politiques) et de fournir ressources et formation."],

  // ---------------- 26·1 GCL ★
  ['gcl', 'Définition de la gestion de la configuration (ISO 24765) ?', "Discipline qui applique surveillance et directives administratives pour identifier et documenter les caractéristiques d'un élément, contrôler les changements, enregistrer et rapporter l'état, vérifier la conformité."],
  ['gcl', '★ Les 6 activités clés de la GCL (SWEBOK) ?', "1 Management et planification (PGCL) · 2 identification de la configuration · 3 contrôle des changements · 4 comptabilité du statut · 5 audit · 6 gestion des versions et livraison."],
  ['gcl', 'Taux de changement des exigences ?', "Il n'est pas rare qu'il soit de 1 % à 3 % par mois."],
  ['gcl', 'Quand le plan de GCL doit-il être approuvé ?', 'Au plus tard à la fin de la phase de spécification du logiciel.'],
  ['gcl', "Qu'est-ce qu'un élément de configuration (ÉCL) ?", "Entité d'une configuration qui répond à une utilisation finale et peut être identifiée de manière univoque à un point de référence donné. Même un outil comme le compilateur peut l'être."],
  ['gcl', 'Identifiant d’un ÉCL : exemple du cours ?', "Partie fixe (nom) + partie variable (évolution) : C001-Rad-Aff-DA-01-02 = contrat C001, radar, affichage, document d'architecture, version 1, révision 2."],
  ['gcl', "Qu'est-ce qu'un référentiel (baseline) ?", "Ensemble d'ÉCL formellement désignés et figés à un moment du cycle de vie ; il ne change que par le contrôle des changements."],
  ['gcl', 'Les 3 types de bibliothèques ?', 'Privée (développeur) · projet (source officielle, accès contrôlé) · publique (éléments communs à plusieurs projets).'],
  ['gcl', '★ Stratégie de branches simple : pour qui, quel but ?', "2 à 3 développeurs qui travaillent ensemble. But : isoler le développement de la branche principale stable et figer chaque version livrée dans sa branche (ex. 1.0.1). La moins coûteuse à gérer."],
  ['gcl', 'Stratégies typique, avancée, fonctionnelle ?', 'Typique : 4 dév. et plus, plusieurs versions. Avancée : 5 et plus, hotfix et paquets de services. Fonctionnelle : 5 et plus, travail par fonctions.'],
  ['gcl', '★ Cycle d’une demande de changement (Wiegers) ?', "Soumise → (analyse d'impact) évaluée → (le CCC autorise) approuvée → modification effectuée → vérifiée → fermée → archivée. Une demande évaluée peut être rejetée puis archivée."],
  ['gcl', 'Le CCC (CCB) : rôle et tâches ?', "Évalue, approuve ou refuse les changements aux ÉCL. Tâches : prioriser, décider de la solution, rédiger les ordres de modification, répondre aux émetteurs, délivrer les droits d'accès, rédiger le compte rendu."],
  ['gcl', 'Audit fonctionnel (ACF) vs physique (ACP) ?', "ACF : la fonctionnalité réelle de chaque ÉCL est conforme aux spécifications. ACP : chaque élément « tel que construit » est traçable aux spécifications ; logiciel et documentation prêts pour la livraison."],
  ['gcl', 'Étapes d’une inspection (cours sur les revues) ?', 'Planification · survol · préparation · réunion · reprise · suivi.'],

  // ---------------- 26·2 Processus ★
  ['ppp', 'La pyramide documentaire ?', "Politiques : pourquoi · processus : quoi, qui, quand · procédures : comment, avec quoi · enregistrements qualité : preuves."],
  ['ppp', '★ Définition d’une politique (ISO 38500) ?', "Énoncés clairs et mesurables de la direction et du comportement privilégiés pour orienter les décisions au sein d'un organisme."],
  ['ppp', 'Ce que la direction doit faire pour que les politiques s’appliquent ?', "Communiquer son engagement · initier, gérer, suivre la mise en œuvre · exiger de solides arguments avant une déviation · budgéter les ressources · fournir la formation."],
  ['ppp', '★ Définition d’un processus (SEI) ?', "Moyens par lesquels les personnes, les procédures et méthodes, et les outils et l'équipement sont intégrés pour produire le résultat souhaité."],
  ['ppp', '★ Description de processus et procédure ?', "Description de processus : expression documentée d'un ensemble d'activités pour un objectif (complète, précise, vérifiable). Procédure : manière spécifiée (série ordonnée d'étapes) d'effectuer une activité ou une tâche."],
  ['ppp', 'Propriétaire de processus ?', "La personne ou l'équipe chargée de définir et de maintenir un processus ; elle approuve l'adaptation."],
  ['ppp', 'ISO 24774 : les 5 attributs d’un processus ?', 'Titre · intention (purpose) · résultats (outcomes) · activités · tâches.'],
  ['ppp', 'Gabarit (template) ?', "Un atout avec des paramètres ou des espaces libres qui sert à construire un atout instancié (ISO 24765)."],
  ['ppp', '★ Qualigram : les 3 niveaux ?', "1 Stratégique : processus, aucun rôle, noms, « pour quoi ? ». 2 Organisationnel : procédures, plusieurs rôles, verbes, « qui fait quoi ? ». 3 Opérationnel : instructions, un seul rôle, tous les moyens, « comment ? avec quoi ? »."],
  ['ppp', '★ Avantages de Qualigram / désavantages de Visio ?', "Qualigram : référentiel unique, hiérarchique (zoom), contrôles inclus, intranet, gabarits et exemples. Visio/LucidChart : outils de dessin, fichiers isolés sans liens ni versions ni approbations ; incohérents à grande échelle."],
  ['ppp', 'Pièges de documentation des processus ?', "Trop volumineuse (shelfware), sur papier, tout en texte, écrite par un consultant externe, qui mélange les types (politique et processus), notation trop complexe."],

  // ---------------- 26·5 Risque ★
  ['risque', 'Définition du risque (ISO 16085 et PMBoK) ?', "ISO 16085 : combinaison de la probabilité d'un événement et de ses conséquences. PMBoK : événement possible dont l'impact sur les objectifs peut être positif ou négatif."],
  ['risque', 'Que faire d’un risque très élevé qui est aussi une opportunité ?', "L'identifier avec l'équipe et en remettre immédiatement la responsabilité au comité de direction ; ne jamais le gérer seul (« gambling »)."],
  ['risque', 'Coût des reprises ?', "Les reprises causées par des exigences, une conception ou un code erronés consomment 40 % à 50 % du coût total du développement."],
  ['risque', '★ Les étapes de la gestion du risque ?', "PMI : identification · analyse qualitative · analyse quantitative et réponse · surveillance. Boehm : évaluation (identification, analyse, priorisation) puis contrôle (planification, résolution, surveillance) + leçons apprises."],
  ['risque', '★ Les 4 types de risques d’un projet ?', 'Techniques · de gestion · contractuels et juridiques · liés au personnel (Westfall).'],
  ['risque', 'Un énoncé de risque contient… ?', "Une condition (circonstances qui créent le doute) et une conséquence (perte immédiate si la condition se concrétise)."],
  ['risque', '★ Formule de la VMA ?', 'VMA = Σ (probabilité × impact en $), menace négative, opportunité positive. Exemple du cours : −20 000 + 10 000 − 7 500 = −17 500 $.'],
  ['risque', 'Grille 6.9 : piège de lecture ?', 'Elle n’est pas symétrique : P1 × C5 est moyen, mais P5 × C1 est faible.'],
  ['risque', 'Stratégies de résolution des risques ?', "Évitement (ne pas faire) · confinement (réserves de temps et budget) · atténuation (réduire l'impact). Aussi : transfert, acceptation, surveillance, plan de contingence."],
  ['risque', 'Formulaire de risque (Wiegers) ?', "Identification · description condition-conséquence · probabilité · perte · exposition (P × perte) · premier indicateur (déclencheur) · atténuation · propriétaire · échéance."],
  ['risque', 'Techniques pour identifier les risques ?', "Entrevues, remue-méninges, FFOM (SWOT), analyse des hypothèses, analyse du chemin critique, bilans de projets, taxonomies et listes de vérification, Ishikawa."],

  // ---------------- 16·1 Plan qualité ★
  ['plan', 'Qu’est-ce que le plan qualité ?', "Une revue du plan de projet par l'équipe d'AQL ; la synthèse du cours."],
  ['plan', '★ La maison de l’AQL, de bas en haut ?', "Base : code de déontologie, support de la direction, groupe d'AQL. Fondations : référentiels, infrastructure qualité, culture qualité. Poutre : plan d'AQL. Piliers : processus clairs, formation constante, amélioration continue. Toit : livraison de qualité, employés heureux."],
  ['plan', '★ But d’IEEE 730-2014 ?', "Produire des preuves qui fondent une déclaration de confiance justifiée que le logiciel est conforme à ses exigences ; exigences minimales pour les processus d'AQL (développement et maintenance)."],
  ['plan', '★ Les 7 sections du plan d’AQL type (IEEE 730) ?', "1 But et portée · 2 définitions · 3 références · 4 vue d'ensemble (organisation et indépendance, risque, outils, normes, effort) · 5 activités (produit, processus) · 6 considérations additionnelles · 7 enregistrements."],
  ['plan', 'Une section du plan ne s’applique pas : que faire ?', "Les sujets sont normatifs, mais noms et ordre des sections sont informatifs. On garde un emplacement avec une justification."],
  ['plan', '★ Les 16 activités d’AQL d’IEEE 730 ?', "5.3 mise en œuvre (6 : établir, coordonner, documenter, exécuter le plan, gérer les enregistrements, évaluer l'indépendance et l'objectivité) · 5.4 assurance produit (5) · 5.5 assurance processus (5)."],
  ['plan', 'Responsabilité de la direction : 3 preuves de soutien ?', "Elle connaît les objectifs de l'AQL · elle fournit des ressources qualifiées · elle reçoit l'information de l'AQL et agit en conséquence."],
  ['plan', 'Les 5 phases du modèle IDEAL ?', 'Démarrage (Initiating) · Diagnostic · Instauration (Establishing) · Action (Acting) · Apprentissage (Leveraging).'],
  ['plan', 'IEEE 1012 : niveaux d’intégrité ?', 'De 1 à 4, le niveau 4 est le plus élevé (conséquence catastrophique). Plus il est élevé, plus il faut d’activités d’AQL.'],
  ['plan', 'IEEE 1012 : les 3 indépendances de la V&V ?', "Technique (autres personnes, autres outils) · managériale (organisation distincte) · financière (budget hors du contrôle du développement). Classique = les trois."],
  ['plan', 'Grille de qualité d’un document ?', "Gabarit utilisé ? sinon 0. O = 1, L = 0,5, S = 0. Contenu 60 % (approprié 0,2, complet 0,2, cohérent 0,1, précis 0,1) · structure 20 % · gestion 20 %. < 60 % refusé, < 75 % à améliorer, > 85 % accepté."],
  ['plan', 'Les 4 catégories de défauts ?', '1 bloquant · 2 important · 3 sans problème majeur (solution existe) · 4 mineur.'],
  ['plan', 'Coût de reprise ?', "Le coût d'itération sur une tâche où il y a un défaut."],

  // ---------------- 16·2 Fournisseurs
  ['fourn', 'CMMI : gestion des accords avec les fournisseurs ?', "Niveau 2 en V1.3. SG 1 établir des accords (type d'acquisition, choisir, établir) · SG 2 respecter les accords (exécuter, accepter, transférer). En V2.0 : SAM et SSS."],
  ['fourn', 'Les 3 types de participants externes ?', 'Sous-traitants · fournisseurs de progiciels · ressources internes du client.'],
  ['fourn', 'Risques des participants externes ?', "Délais, qualité des livrables, difficulté de transition (mainteneurs et opérations peuvent refuser des livrables)."],
  ['fourn', 'ISO 12207 : les 6 activités d’acquisition ?', "Préparation · demande de soumission · sélection du fournisseur · établissement du contrat · suivi du contrat · acceptation."],
  ['fourn', 'Types de contrats et risque de dépassement ?', "Régie + % du coût : client. Régie + honoraire fixe : client. Régie + intéressement : partagé. Prix fixe + intéressement : partagé (formule). Prix fixe : fournisseur."],
  ['fourn', 'Simulation : coût d’un jour de dépassement ?', 'Prix ÷ nombre de jours : 6 450 000 / 249 = 25 903,61 $. À 270 j : y = 1,1245x − 250 ≈ 54 % fournisseur, 46 % client.'],
  ['fourn', 'Revue de contrat initiale vs finale ?', "Initiale (ébauche de proposition) : besoins clarifiés, solutions de rechange, responsabilités, risque, ressources et calendrier. Finale (avant signature) : questions non résolues, clauses correctes, aucun changement non convenu."],
  ['fourn', 'La règle d’or du contrat ?', "Un bon contrat est celui que vous présentez à l'intégrateur : le vôtre vous protège, le sien le protège."],
  ['fourn', 'Grille de sélection d’un fournisseur ?', "Poids fixés avant d'ouvrir les soumissions ; pointage 0/1/3/5 (ou 0/3/6/10) avec instructions précises pour les évaluateurs ; total pondéré."],
];

// Identifiant stable tiré du texte de la question (garde la progression si l'ordre change).
const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

export const cards: Card[] = raw.map(([ch, q, a]) => ({ id: `mgl805-${hash(q)}`, ch, q, a }));
