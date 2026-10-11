export type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  sections: { title: string; index: number }[];
  examples: number;
  widgets: { id: string; title: string }[];
  hasRecap: boolean;
  text: string;
};

/** Question du quiz : qcm (choix), vf (vrai/faux), num (calcul), ex (exercice auto-corrigé). */
export type Question = {
  c: number;
  t: 'qcm' | 'vf' | 'num' | 'ex';
  q: string;
  o?: string[];
  a?: number | boolean;
  tol?: number;
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
};
