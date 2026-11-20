// Exercice « Trier les pratiques ITIL 4 » : les 34 pratiques et leur famille, reprises de la page « Révisions MTI825 ».
// Chaque pratique a sa définition (celle de la page) et un exemple concret pour voir à quoi elle sert.

import type { SortExercise, SortFamily, SortItem } from '@/lib/types';

const families: SortFamily[] = [
  { id: 'gen', title: 'Pratiques générales', sub: 'Orienter la gestion des TI (stratégique)' },
  { id: 'gst', title: 'Gestion des services', sub: 'Gérer les services TI (tactique)' },
  { id: 'tech', title: 'Pratiques techniques', sub: 'Supporter la gestion des services (opérationnel)' },
];

const items: SortItem[] = [
  // ---------- Pratiques générales (14)
  {
    name: 'Architecture',
    family: 'gen',
    def: 'Vue d’ensemble des composantes de l’organisation et de leurs interactions.',
    ex: 'Avant de choisir un nouveau logiciel de paie, l’architecte vérifie comment il s’intégrera aux systèmes RH, comptables et à l’annuaire existants.',
  },
  {
    name: 'Amélioration continue',
    family: 'gen',
    def: 'Aligner et améliorer services et pratiques, en 6 étapes.',
    ex: 'Le registre d’amélioration contient « réduire de 30 % le délai de création des comptes étudiants d’ici mars » ; l’équipe mesure, agit puis vérifie le résultat.',
  },
  {
    name: 'Sécurité de l’information',
    family: 'gen',
    def: 'ISO 27000 : confidentialité, intégrité, disponibilité.',
    ex: 'L’université impose l’authentification multifacteur et le chiffrement des portables pour protéger les dossiers des étudiants.',
  },
  {
    name: 'Connaissances',
    family: 'gen',
    def: 'La bonne information au bon moment (SKMS).',
    ex: 'Après chaque incident résolu, l’agent rédige un article « comment réinitialiser son accès VPN » dans la base de connaissances.',
  },
  {
    name: 'Mesures et rapports',
    family: 'gen',
    def: 'Buts, CSF, KPI, métriques, mesures.',
    ex: 'Le tableau de bord mensuel suit le KPI « 90 % des demandes traitées en moins de 24 h » et le présente à la direction.',
  },
  {
    name: 'Changement organisationnel',
    family: 'gen',
    def: 'Gérer l’impact humain des changements.',
    ex: 'Pour le passage à Microsoft 365, on prévoit des formations, des ambassadeurs dans chaque service et une communication sur ce qui change pour les employés.',
  },
  {
    name: 'Portefeuilles',
    family: 'gen',
    def: 'La bonne combinaison de services : futurs, actuels, retirés.',
    ex: 'Le comité décide de financer un nouveau portail étudiant et de retirer l’ancien service de messagerie interne.',
  },
  {
    name: 'Projets',
    family: 'gen',
    def: 'Approches prédictive ou agile.',
    ex: 'Le déménagement du centre de données est mené comme un projet : charte, budget, échéancier Gantt et chef de projet.',
  },
  {
    name: 'Relations',
    family: 'gen',
    def: 'Relations avec les parties prenantes, niveau stratégique et tactique.',
    ex: 'Le gestionnaire de relations rencontre chaque trimestre le doyen pour comprendre ses besoins et présenter la feuille de route TI.',
  },
  {
    name: 'Risques',
    family: 'gen',
    def: 'ISO 31000 : identifier, analyser (BIA), minimiser.',
    ex: 'L’analyse d’impact (BIA) montre qu’une panne du système d’inscription pendant la rentrée coûterait très cher : on ajoute un serveur de relève.',
  },
  {
    name: 'Finances',
    family: 'gen',
    def: 'Budget, réel, facturation, coûts/bénéfices.',
    ex: 'Les TI refacturent chaque mois à chaque faculté le coût de ses licences et de son stockage infonuagique.',
  },
  {
    name: 'Stratégie',
    family: 'gen',
    def: 'Vision TI alignée sur les affaires, SWOT, plan directeur.',
    ex: 'Le plan directeur TI sur 3 ans, appuyé par un SWOT, fixe l’objectif « 80 % des applications dans le nuage » pour soutenir la croissance de l’université.',
  },
  {
    name: 'Fournisseurs',
    family: 'gen',
    def: 'Contrats et performance : insourcing, outsourcing, partenariat, multi-sourcing.',
    ex: 'On renégocie le contrat de l’impartiteur du centre d’appels et on suit chaque mois s’il respecte les pénalités prévues.',
  },
  {
    name: 'Ressources humaines et talents',
    family: 'gen',
    def: 'Les bonnes compétences dans les bons rôles.',
    ex: 'Faute d’expertise infonuagique, les TI recrutent un architecte cloud et paient une certification AWS à deux administrateurs.',
  },

  // ---------- Gestion des services (17)
  {
    name: 'Disponibilité',
    family: 'gst',
    def: 'Niveaux de disponibilité, MTBF, MTRS, SPOF.',
    ex: 'Le site Moodle doit être disponible 99,5 % du temps ; on calcule le MTBF et on supprime le point unique de défaillance (SPOF) en doublant le serveur.',
  },
  {
    name: 'Analyse d’affaires',
    family: 'gst',
    def: 'Analyser les besoins et recommander des solutions.',
    ex: 'L’analyste interroge le registraire, cartographie le processus d’inscription et recommande un formulaire en ligne plutôt qu’un formulaire papier.',
  },
  {
    name: 'Capacité et performance',
    family: 'gst',
    def: 'Capacité actuelle et future, au meilleur coût.',
    ex: 'En prévision du pic d’inscriptions d’août, on augmente la capacité des serveurs pour que le portail réponde en moins de 2 secondes.',
  },
  {
    name: 'Changements',
    family: 'gst',
    def: 'Standard, normal (CAB), urgent (ECAB).',
    ex: 'La mise à jour du pare-feu est un changement normal : elle passe au CAB mardi. Un correctif de sécurité critique passerait à l’ECAB le jour même.',
  },
  {
    name: 'Incidents',
    family: 'gst',
    def: 'Restaurer le service rapidement.',
    ex: 'L’imprimante du 3ᵉ étage ne répond plus : le technicien la redémarre pour que le service reprenne au plus vite, sans chercher la cause profonde.',
  },
  {
    name: 'Actifs',
    family: 'gst',
    def: 'Valeur financière et cycle de vie des actifs.',
    ex: 'Chaque portable est inscrit avec son prix, sa date d’achat et sa fin de garantie, puis remplacé après 4 ans.',
  },
  {
    name: 'Surveillance et événements',
    family: 'gst',
    def: 'Détecter les changements d’état significatifs.',
    ex: 'L’outil de supervision envoie une alerte quand le disque d’un serveur dépasse 90 % de remplissage.',
  },
  {
    name: 'Problèmes',
    family: 'gst',
    def: 'Trouver et corriger la cause des incidents.',
    ex: 'Le VPN tombe chaque lundi matin : l’équipe fait un 5 Pourquoi, trouve une licence saturée et corrige la cause pour que l’incident ne revienne plus.',
  },
  {
    name: 'Versions',
    family: 'gst',
    def: 'Rendre disponibles les services nouveaux ou modifiés (livraisons).',
    ex: 'La version 2.3 de l’application mobile regroupe 5 nouvelles fonctions ; elle est annoncée aux utilisateurs pour le 15 janvier.',
  },
  {
    name: 'Catalogue',
    family: 'gst',
    def: 'Source unique sur les services offerts, 3 vues.',
    ex: 'Le portail liste tous les services TI offerts (« Wi-Fi invité », « compte courriel »…) avec, pour chacun, qui peut le demander et le délai.',
  },
  {
    name: 'Configurations',
    family: 'gst',
    def: 'CI, CMDB, CMS : contrôler les composants du service.',
    ex: 'La CMDB montre que le service « Paie » dépend du serveur SRV-12 et de la base Oracle : avant d’arrêter SRV-12, on sait quel service sera touché.',
  },
  {
    name: 'Continuité',
    family: 'gst',
    def: 'Reprise des services dans les délais, en soutien du BCM.',
    ex: 'Après un incendie dans la salle des serveurs, le plan de relève redémarre la paie sur le site de secours en moins de 8 heures.',
  },
  {
    name: 'Conception',
    family: 'gst',
    def: 'Concevoir un service utile et livrable (UX, design thinking).',
    ex: 'Avant de créer le service de prêt de portables, on fait des ateliers de design thinking avec des étudiants pour définir le parcours de réservation.',
  },
  {
    name: 'Centre de services',
    family: 'gst',
    def: 'Point de contact unique (SPOC).',
    ex: 'Les étudiants appellent un seul numéro, ou écrivent sur un seul portail, pour tout problème ou toute demande TI.',
  },
  {
    name: 'Niveaux de services',
    family: 'gst',
    def: 'Objectifs de qualité et SLA.',
    ex: 'Le SLA signé avec la faculté garantit la résolution d’un incident majeur en moins de 4 heures, avec un rapport mensuel.',
  },
  {
    name: 'Demandes de services',
    family: 'gst',
    def: 'Requêtes prévues : accès, portable, information…',
    ex: 'Une nouvelle employée demande un accès à Teams et un portable : c’est une demande prévue, traitée selon une procédure standard, pas un incident.',
  },
  {
    name: 'Validation et tests',
    family: 'gst',
    def: 'Critères d’acceptation, tests d’utilité et de garantie.',
    ex: 'Avant la mise en ligne du nouveau portail, on vérifie qu’il répond aux besoins (utilité) et qu’il supporte 2 000 connexions simultanées (garantie).',
  },

  // ---------- Pratiques techniques (3)
  {
    name: 'Déploiement',
    family: 'tech',
    def: 'Mettre en production : par phases, continu, Big Bang, pull.',
    ex: 'Le nouveau poste de travail Windows est installé d’abord au service des finances, puis dans les autres services, une phase à la fois.',
  },
  {
    name: 'Infrastructure et plateformes',
    family: 'tech',
    def: 'Vue d’ensemble et surveillance de l’infra (IaaS, PaaS, SaaS).',
    ex: 'L’équipe gère les serveurs, le réseau et les machines virtuelles Azure (IaaS) sur lesquels tournent les applications.',
  },
  {
    name: 'Développement logiciel',
    family: 'tech',
    def: 'Des applications fonctionnelles, fiables, maintenables.',
    ex: 'Les développeurs codent la nouvelle fonction « prise de rendez-vous » de l’application mobile, avec revues de code et tests automatisés.',
  },
];

export const itilSort: SortExercise = {
  id: 'itil',
  title: 'Les 34 pratiques ITIL 4',
  chapter: 'itil',
  intro: 'Classer chaque pratique dans sa famille.',
  prompt: 'Dans quelle famille ?',
  unit: 'pratiques',
  families,
  items,
};
