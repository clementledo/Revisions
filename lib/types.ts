export type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  sections: { title: string; index: number }[];
  examples: number;
  /** Encadrés « Piège d'examen » de la partie. */
  traps: number;
  /** Partie signalée par le prof (★). */
  hot: boolean;
  widgets: { id: string; title: string }[];
  hasRecap: boolean;
  text: string;
};

/** Question du quiz : qcm (choix), vf (vrai/faux), num (calcul), fill (texte à trous), ex (exercice auto-corrigé). */
export type Question = {
  c: number;
  t: 'qcm' | 'vf' | 'num' | 'fill' | 'ex';
  /** Numéro dans la page (A1, B3…). */
  n?: string;
  q: string;
  o?: string[];
  a?: number | boolean;
  tol?: number;
  /** Réponses acceptées d'un texte à trous. */
  acc?: string[];
  e: string;
  /** Chapitre (id dans la page), ajouté au chargement du cours. */
  ch?: string;
};

export type Card = { id: string; ch: string; q: string; a: string };

export type Course = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  color: string;
  /** Page de révision embarquée (assets/pages/<id>.html), absente tant que le contenu n'est pas fourni. */
  page?: number;
  antiseche?: number;
  chapters: Chapter[];
  /** Chapitres qui sont des cours (les autres : aide-mémoire, quiz). */
  lessons: string[];
  /** Numéro de cours du quiz (Question.c) → chapitres. */
  quizChapters: Record<number, string[]>;
  questions: Question[];
  cards: Card[];
  /** Mots du nom de fichier qui désignent une partie (nom sans accents, en minuscules), testés dans l'ordre. */
  slideKeys?: [string, RegExp][];
};
