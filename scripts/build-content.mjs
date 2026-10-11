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

const COURSES = [{ id: 'mti881' }];

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

for (const { id } of COURSES) {
  const html = readFileSync(`content/source/${id}.html`, 'utf8');
  writeFileSync(`assets/pages/${id}.html`, prerenderPage(html));

  const root = parse(html);
  const chapters = root.querySelectorAll('section.course').map((sec) => {
    const h2 = sec.querySelector('h2');
    const sections = sec
      .querySelectorAll('h3')
      .filter((h) => !h.closest('aside'))
      .map((h, i) => ({ title: clean(h.text), index: i }));
    const text = clean(sec.text.replace(/\\\(|\\\)|\\\[|\\\]/g, ' '));
    return {
      id: sec.id,
      eyebrow: clean(sec.querySelector('.eyebrow')?.text ?? ''),
      title: clean(h2?.text ?? ''),
      lede: clean(sec.querySelector('.lede')?.text ?? ''),
      sections,
      examples: sec.querySelectorAll('.box.ex').length,
      widgets: sec.querySelectorAll('.widget').map((w) => ({ id: w.id, title: clean(w.querySelector('h4')?.text ?? '') })),
      hasRecap: !!sec.querySelector('aside.recap'),
      text,
    };
  });

  // Questions du quiz de la page (tableau QUESTIONS de son script).
  const src = html.slice(html.indexOf('const QUESTIONS = ['));
  const arr = src.slice('const QUESTIONS = '.length, src.indexOf('\n];') + 2);
  const questions = new Function(`return ${arr}`)();

  const out = `// Fichier généré par scripts/build-content.mjs : ne pas modifier à la main.
import type { Chapter, Question } from '@/lib/types';

export const chapters: Chapter[] = ${JSON.stringify(chapters, null, 1)};

export const questions: Question[] = ${JSON.stringify(questions, null, 1)};
`;
  writeFileSync(`content/generated/${id}.ts`, out);

  const sheet = `content/${id}/antiseche.html`;
  if (existsSync(sheet)) writeFileSync(`assets/pages/${id}-antiseche.html`, renderMath(readFileSync(sheet, 'utf8')));
  console.log(`${id} : ${chapters.length} chapitres, ${questions.length} questions`);
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
