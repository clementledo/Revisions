import { cards as mti881Cards } from '@/content/mti881/cartes';
import { chapters as mti881Chapters, questions as mti881Questions } from '@/content/generated/mti881';
import type { Course, Question } from '@/lib/types';

// Le quiz de la page MTI881 regroupe Gymnasium et PyTorch sous « cours 2 » : on range chaque question
// dans le bon chapitre d'après son vocabulaire.
const PYTORCH = /torch|tenseur|tensor|gradient|backward|autograd|optimi|perte|loss|module|softmax|crossentropy|zero_grad|lot|batch|device|cuda|dtype|reshape|flatten/i;
const withChapters = (qs: Question[]) =>
  qs.map((q) => ({ ...q, ch: q.c === 2 ? (PYTORCH.test(q.q + ' ' + q.e) ? 'c2b' : 'c2a') : `c${q.c}` }));

export const COURSES: Course[] = [
  {
    id: 'mti881',
    code: 'MTI881',
    title: 'Apprentissage par renforcement',
    subtitle: 'Cours 1 à 6 · A2026',
    color: '#0e6b63',
    page: require('@/assets/pages/mti881.html'),
    antiseche: require('@/assets/pages/mti881-antiseche.html'),
    chapters: mti881Chapters,
    lessons: ['c1', 'c2a', 'c2b', 'c3', 'c4', 'c5', 'c6'],
    quizChapters: { 1: ['c1'], 2: ['c2a', 'c2b'], 3: ['c3'], 4: ['c4'], 5: ['c5'], 6: ['c6'] },
    questions: withChapters(mti881Questions),
    cards: mti881Cards,
  },
  {
    id: 'mgl805',
    code: 'MGL805',
    title: 'Qualité logicielle',
    subtitle: 'Contenu à venir',
    color: '#4c5bd4',
    chapters: [],
    lessons: [],
    quizChapters: {},
    questions: [],
    cards: [],
  },
  {
    id: 'mti825',
    code: 'MTI825',
    title: 'Gestion des services TI',
    subtitle: 'Contenu à venir',
    color: '#c46a1a',
    chapters: [],
    lessons: [],
    quizChapters: {},
    questions: [],
    cards: [],
  },
];

export const courseById = (id: string) => COURSES.find((c) => c.id === id);
export const chapterLabel = (c: { eyebrow: string; id: string }) => c.eyebrow || c.id.toUpperCase();
