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
  {
    id: 'mti825',
    parse: parseMts,
    eyebrows: {
      plan: 'Plan', rdmaic: 'RDMAIC', gouv: 'Gouvernance', lean: 'Lean', itil: 'ITIL 4', agile: 'Agilité',
      devops: 'DevOps', archi: 'Architecture', cloud: 'Infonuagique', impart: 'Impartition', blanc: 'Examen blanc', liens: 'Liens',
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

// --- Page MTI825 : onglets construits en JavaScript à partir d'un tableau M (fiche + examens blancs par thème).
// On en fait une page statique avec une <section class="course"> par onglet, comme les autres cours ;
// l'examen blanc complet (tirage au hasard + minuteur de 3 h) garde le code de la page.
function parseMts(raw, conf) {
  const html0 = raw.replace(/<!-- frame-runtime -->[\s\S]*?<!-- \/frame-runtime -->/, '');
  const script = [...html0.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((x) => x.includes('M.push('));
  const data = script.slice(0, script.indexOf('/* ============ MOTEUR'));
  const { M, LINKS } = new Function(`${data};return { M, LINKS };`)();
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const exam = (e, key) =>
    `<div class="exam" id="ex-${key}"><div class="hd"><h3 style="margin:0">${e.lvl === 2 ? '<span class="tag">Niveau 2</span>' : ''}Examen blanc · ${e.t}</h3><span class="pts">${e.pts}</span></div>` +
    `<p class="q">${e.q}</p><textarea data-key="${key}" placeholder="Rédige ta réponse ici avant d’ouvrir le corrigé (brouillon gardé sur le téléphone)." aria-label="Ma réponse"></textarea>` +
    `<details class="key"><summary>Voir le corrigé modèle</summary>${e.a}</details></div>`;
  const sections = M.map(
    (m) =>
      `<section class="course" id="${m.id}"><h2>${m.title}</h2><p class="src">${m.src}</p>${m.secs.join('')}` +
      (m.exams ?? []).map((e, i) => exam(e, m.id + i)).join('') +
      '</section>',
  );
  sections.push(
    '<section class="course" id="blanc"><h2>Examen blanc complet</h2><div id="blanc-body"></div></section>',
    '<section class="course" id="liens"><h2>Vidéos et ressources</h2><p class="src">Liens tirés de ta page Moodle MTI825 · s’ouvrent dans le navigateur</p>' +
      LINKS.map((g) => `<div class="card"><h3>${g.g}</h3><ul>${g.items.map((it) => `<li><a href="${it.u}">${esc(it.n)}</a></li>`).join('')}</ul></div>`).join('') +
      '</section>',
  );
  // Moteur de l'examen complet, repris de la page (brouillons gardés dans le stockage de la page).
  const engine = script.slice(script.indexOf('/* ---- examen complet ---- */'), script.indexOf('allTabs().forEach'));
  const runtime = `<script>
var M=${JSON.stringify(M.filter((m) => m.exams))};
var CASES=M.find(function(m){return m.id==="rdmaic"}).exams;
var THEMES=M.filter(function(m){return m.id!=="rdmaic"});
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function examHtml(e,key){var saved=store.get("draft:"+key)||"";
  return '<div class="exam"><div class="hd"><h3 style="margin:0">'+(e.lvl===2?'<span class="tag">Niveau 2</span>':'')+'Examen blanc · '+e.t+'</h3><span class="pts">'+e.pts+'</span></div>'+
  '<p class="q">'+e.q+'</p><textarea data-key="'+key+'" aria-label="Ma réponse">'+saved.replace(/</g,"&lt;")+'</textarea>'+
  '<details class="key"><summary>Voir le corrigé modèle</summary>'+e.a+'</details></div>';}
var main=null;
function render(){main=document.getElementById("blanc-body");if(!main)return;main.innerHTML=finalHtml();initFinal();}
${engine}
document.addEventListener("DOMContentLoaded",function(){
  render();
  [].forEach.call(document.querySelectorAll("section:not(#blanc) textarea[data-key]"),function(ta){
    ta.value=store.get("draft:"+ta.dataset.key)||"";
    ta.addEventListener("input",function(){store.set("draft:"+ta.dataset.key,ta.value)});
  });
});
</script>`;
  const head = html0.slice(0, html0.indexOf('<div class="wrap">'));
  const html = `${head}<div class="wrap"><main>${sections.join('\n')}</main></div>${runtime}</body></html>`;

  const root = parse(html);
  const chapters = root.querySelectorAll('section.course').map((sec) => {
    const m = M.find((x) => x.id === sec.id);
    const body = sec.clone();
    body.querySelectorAll('.exam, script').forEach((x) => x.remove());
    return {
      id: sec.id,
      eyebrow: conf.eyebrows[sec.id] ?? m?.tag ?? '',
      title: clean(sec.querySelector('h2').text),
      lede: m ? clean(parse(m.src).text) : '',
      sections: h3s(sec),
      // Les examens blancs sont repris comme exercices de l'app (écran Exercices).
      examples: 0,
      traps: sec.querySelectorAll('.trap').length,
      hot: false,
      widgets: [],
      hasRecap: false,
      text: clean(body.text),
    };
  });
  // Chaque examen blanc devient un exercice à corrigé dans l'app.
  const questions = M.flatMap((m) =>
    (m.exams ?? []).map((e, i) => ({
      c: 0,
      t: 'ex',
      n: `${conf.eyebrows[m.id]} ${i + 1}`,
      ch: m.id,
      q: `${e.t} (${e.pts}${e.lvl === 2 ? ', niveau 2' : ''})\n\n${toText(parse(`<div>${e.q}</div>`).firstChild)}`,
      e: toText(parse(`<div>${e.a}</div>`).firstChild),
    })),
  );
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
