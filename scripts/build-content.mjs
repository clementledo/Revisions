// Prépare le contenu des cours pour l'app (à relancer après chaque changement de contenu) :
//  - assets/pages/<cours>.html : la page de révision d'origine, lue telle quelle dans l'app ;
//  - content/generated/<cours>.ts : chapitres, sections, questions et texte de recherche ;
//  - assets/pages/<cours>-antiseche.html : l'antisèche, formules déjà dessinées (export PDF hors ligne) ;
//  - assets/viewer/pdf.html : la visionneuse de slides (pdf.js embarqué).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

const COURSES = [
  { id: 'mti881', parse: parseMti },
  {
    id: 'mgl805',
    parse: parseMgl,
    // Noms courts des parties (la page n'affiche que des numéros de séance : 25·1, 26·2…).
    eyebrows: {
      iapriv: 'IA privée', exig: 'Exigences', iag: 'Sécurité IAG', normes: 'Normes', cmmi: 'CMMI V2.0',
      gcl: 'Config. (GCL)', ppp: 'Processus', risque: 'Risque', plan: 'Plan qualité', fourn: 'Fournisseurs',
    },
  },
];

mkdirSync('assets/pages', { recursive: true });
mkdirSync('assets/viewer', { recursive: true });
mkdirSync('content/generated', { recursive: true });

const clean = (s) => s.replace(/\s+/g, ' ').trim();

// --- Formules TeX → SVG (pour l'antisèche imprimable)
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: 'local' });
const mj = mathjax.document('', { InputJax: tex, OutputJax: svg });
const renderTex = (src, display) => {
  const node = mj.convert(src, { display });
  return adaptor.outerHTML(node);
};
const renderMath = (html) =>
  html
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => `<div class="m">${renderTex(t, true)}</div>`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => renderTex(t, false));

// Page de révision : formules dessinées d'avance (plus besoin de MathJax en ligne, s'affiche tout de suite).
// On ne touche pas aux scripts, styles et blocs de code.
function prerenderPage(html) {
  const parts = html.split(/(<(script|style|pre|code|textarea)\b[\s\S]*?<\/\2>)/i);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i % 3 === 2) continue; // nom de balise capturé
    if (i % 3 === 1) {
      // Le script MathJax en ligne devient inutile.
      out += /mathjax/i.test(part.slice(0, 200)) ? '' : part;
    } else out += renderMath(part);
  }
  const css = adaptor.textContent(svg.styleSheet(mj));
  return out.replace('</head>', `<style id="mjx-svg">${css}</style></head>`);
}

// --- Page MTI881 : sections « course », quiz dans un tableau QUESTIONS du script.
function parseMti(html) {
  const root = parse(html);
  const chapters = root.querySelectorAll('section.course').map((sec) => {
    const h2 = sec.querySelector('h2');
    return {
      id: sec.id,
      eyebrow: clean(sec.querySelector('.eyebrow')?.text ?? ''),
      title: clean(h2?.text ?? ''),
      lede: clean(sec.querySelector('.lede')?.text ?? ''),
      sections: h3s(sec),
      examples: sec.querySelectorAll('.box.ex').length,
      traps: 0,
      hot: false,
      widgets: sec.querySelectorAll('.widget').map((w) => ({ id: w.id, title: clean(w.querySelector('h4')?.text ?? '') })),
      hasRecap: !!sec.querySelector('aside.recap'),
      text: clean(sec.text.replace(/\\\(|\\\)|\\\[|\\\]/g, ' ')),
    };
  });
  const src = html.slice(html.indexOf('const QUESTIONS = ['));
  const arr = src.slice('const QUESTIONS = '.length, src.indexOf('\n];') + 2);
  return { html, chapters, questions: new Function(`return ${arr}`)() };
}

const h3s = (sec) =>
  sec
    .querySelectorAll('h3')
    .filter((h) => !h.closest('aside'))
    .map((h, i) => ({ title: clean(h.text), index: i }));

// Texte lisible d'un corrigé HTML (paragraphes, listes, tableaux ligne par ligne).
function toText(el) {
  let html = el.innerHTML
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_, row) => {
      const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((m) => m[1]);
      return '\n' + cells.filter((c) => c.replace(/<[^>]+>/g, '').trim()).join(' · ') + '\n';
    })
    .replace(/<li[^>]*>/g, '\n• ')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(p|div|h4|h5|ul|ol|table|dd|summary)>/g, '\n\n')
    .replace(/<dt[^>]*>/g, '\n')
    .replace(/<\/dt>/g, ' : ');
  return parse(html)
    .text.split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// --- Page MGL805 : <section id> avec en-tête .shead, quiz en HTML (.q) dans la section #quiz.
function parseMgl(raw, conf) {
  // Le cadre d'exécution de claude.ai n'a rien à faire dans l'app.
  let html = raw.replace(/<!-- frame-runtime -->[\s\S]*?<!-- \/frame-runtime -->/, '');
  // Classe commune aux pages : l'app sait alors n'afficher qu'une partie.
  html = html.replace(/<section id="(\w+)">/g, '<section id="$1" class="course">');
  const root = parse(html);
  const hot = new Set(root.querySelectorAll('nav.toc a.hot').map((a) => a.getAttribute('href').slice(1)));
  const chapters = root
    .querySelectorAll('section.course')
    .filter((sec) => sec.id !== 'quiz')
    .map((sec) => ({
      id: sec.id,
      eyebrow: conf.eyebrows[sec.id] ?? clean(sec.querySelector('.snum')?.text ?? ''),
      title: clean(sec.querySelector('.shead h2')?.text ?? ''),
      lede: clean(sec.querySelector('.ssub')?.text ?? ''),
      sections: h3s(sec),
      examples: 0,
      traps: sec.querySelectorAll('.trap').length,
      hot: hot.has(sec.id),
      widgets: [],
      hasRecap: false,
      text: clean(sec.text),
    }));

  const where = JSON.parse(readFileSync(`content/${conf.id}/quiz-chapitres.json`, 'utf8'));
  const questions = root.querySelectorAll('#quiz .q').map((el) => {
    const stem = el.querySelector('.stem');
    const n = clean(stem.querySelector('.n').text);
    stem.querySelector('.n').remove();
    const q = { c: 0, n, ch: where[n], q: toText(stem) };
    const why = el.querySelector('.why');
    const a = el.getAttribute('data-a');
    if (!where[n]) throw new Error(`Question ${n} sans chapitre (content/${conf.id}/quiz-chapitres.json)`);
    if (el.classList.contains('vf')) return { ...q, t: 'vf', a: a === '0', e: toText(why) };
    if (el.classList.contains('fillq')) return { ...q, t: 'fill', acc: a.split('|'), e: toText(why) };
    if (a != null) return { ...q, t: 'qcm', o: el.querySelectorAll('.opt').map((o) => clean(o.childNodes.at(-1).text)), a: Number(a), e: toText(why) };
    return { ...q, t: 'ex', e: toText(el.querySelector('details .body')) };
  });
  return { html, chapters, questions };
}

for (const conf of COURSES) {
  const { id } = conf;
  const { html, chapters, questions } = conf.parse(readFileSync(`content/source/${id}.html`, 'utf8'), conf);
  writeFileSync(`assets/pages/${id}.html`, prerenderPage(html));

  const out = `// Fichier généré par scripts/build-content.mjs : ne pas modifier à la main.
import type { Chapter, Question } from '@/lib/types';

export const chapters: Chapter[] = ${JSON.stringify(chapters, null, 1)};

export const questions: Question[] = ${JSON.stringify(questions, null, 1)};
`;
  writeFileSync(`content/generated/${id}.ts`, out);

  const sheet = `content/${id}/antiseche.html`;
  if (existsSync(sheet)) writeFileSync(`assets/pages/${id}-antiseche.html`, renderMath(readFileSync(sheet, 'utf8')));
  const count = (t) => questions.filter((q) => q.t === t).length;
  console.log(`${id} : ${chapters.length} chapitres, ${questions.length} questions (${['qcm', 'vf', 'fill', 'num', 'ex'].map((t) => `${t} ${count(t)}`).join(', ')})`);
}

// --- Visionneuse PDF : pdf.js embarqué en texte, chargé en modules blob (marche en file://).
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
const lib = readFileSync('node_modules/pdfjs-dist/build/pdf.min.mjs', 'utf8');
const worker = readFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'utf8');
const viewer = readFileSync('scripts/pdf-viewer.html', 'utf8')
  .replace('/*PDFJS_LIB*/', () => esc(lib))
  .replace('/*PDFJS_WORKER*/', () => esc(worker));
writeFileSync('assets/viewer/pdf.html', viewer);
console.log('visionneuse PDF prête');
