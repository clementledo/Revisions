import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

import { pageCss, type Palette } from '@/lib/theme';

/** Copie un fichier embarqué (page HTML) en local et renvoie son adresse file://. */
export function useAssetUri(mod: number | undefined) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (mod == null) return;
    let alive = true;
    Asset.fromModule(mod)
      .downloadAsync()
      .then((a) => alive && setUri(a.localUri ?? a.uri))
      .catch((e) => alive && setError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, [mod]);
  return { uri, error };
}

export type PageMode = 'chapter' | 'recap' | 'examples' | 'traps' | 'all';

export type PageOptions = {
  mode: PageMode;
  chapter?: string;
  /** Section à afficher : index du titre h3 dans le chapitre, ou id d'un élément (calculateur…). */
  anchor?: string;
  /** Texte à surligner (venant de la recherche). */
  find?: string;
  fontScale?: number;
};

/** CSS + JS injectés avant le chargement : thème de l'app, un seul chapitre, pas de sommaire. */
export function pagePrelude(p: Palette, o: PageOptions) {
  const ch = o.chapter ? `#${o.chapter}` : '';
  let css =
    pageCss(p) +
    // Sommaires et en-têtes des pages (MTI881 : .side/.hero ; MGL805 : .mast/nav.toc) : l'app a les siens.
    '.mobilebar,.side,.hero,.mast,nav.toc,footer{display:none!important}.shell{display:block!important}' +
    'main{padding:18px 16px 96px!important}.wrap{padding-top:18px!important;padding-bottom:96px!important}.wrap:has(>.mast){display:none!important}html{scroll-padding-top:12px!important;-webkit-text-size-adjust:100%}' +
    `body{font-size:${Math.round(16 * (o.fontScale ?? 1))}px!important}` +
    'mark.rv-find{background:var(--reward-soft);color:inherit;border-radius:3px;outline:2px solid var(--reward)}';
  if (o.mode !== 'all' && ch) {
    css += `section.course{display:none!important}section.course${ch}{display:block!important;padding-top:0!important;border-top:0!important}`;
  }
  if (o.mode === 'recap' && ch) {
    css += `section${ch}>*:not(aside.recap){display:none!important}section${ch}>aside.recap{margin-top:0!important}`;
  }
  return `(function(){
window.__RV=${JSON.stringify(o)};
window.__RVCSS=${JSON.stringify(css)};
window.__RVTHEME=${JSON.stringify(p.dark ? 'dark' : 'light')};
window.__rvApply=function(){
  var h=document.documentElement;if(!h)return false;
  h.setAttribute('data-theme',window.__RVTHEME);
  if(!document.getElementById('rv-style')){var s=document.createElement('style');s.id='rv-style';s.textContent=window.__RVCSS;(document.head||h).appendChild(s);}
  return true;
};
if(!window.__rvApply()){new MutationObserver(function(m,obs){if(window.__rvApply())obs.disconnect();}).observe(document,{childList:true,subtree:true});}
document.addEventListener('DOMContentLoaded',window.__rvApply);
})();true;`;
}

/** Script lancé après chargement : filtre des exemples, ancre, surlignage, liens internes. */
export const PAGE_AFTER = `(function(){
window.__rvApply&&window.__rvApply();
var o=window.__RV||{};var post=function(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m));};
var sec=o.chapter?document.getElementById(o.chapter):null;
if((o.mode==='examples'||o.mode==='traps')&&sec){
  var kids=[].slice.call(sec.children),lastH=null,count=0;
  var keep=o.mode==='traps'?'.trap':'.box.ex, details.sol, .widget';
  kids.forEach(function(k){k.style.display='none';});
  kids.forEach(function(k){
    if(k.tagName==='H3'){lastH=k;return;}
    if(k.matches(keep)){k.style.display='';count++;if(lastH){lastH.style.display='';}}
  });
  post({type:'examples',count:count});
}
// Liens vers une autre partie de la page : l'app ouvre le bon chapitre.
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var id=a.getAttribute('href').slice(1);var t=document.getElementById(id);if(!t)return;
  var s=t.closest('section.course');
  if(sec&&s&&s!==sec){e.preventDefault();post({type:'nav',chapter:s.id,anchor:id});}
},true);
function go(){
  var el=null;
  if(o.find){
    var w=document.createTreeWalker(sec||document.body,NodeFilter.SHOW_TEXT,null);var n,q=o.find.toLowerCase();
    while((n=w.nextNode())){var i=n.data.toLowerCase().indexOf(q);
      if(i>=0&&n.parentElement&&n.parentElement.offsetParent!==null&&!n.parentElement.closest('script,style')){
        var r=document.createRange();r.setStart(n,i);r.setEnd(n,i+q.length);var m=document.createElement('mark');m.className='rv-find';r.surroundContents(m);el=m;break;}}
  }
  if(!el&&o.anchor&&sec){
    if(/^\\d+$/.test(o.anchor)){var hs=[].filter.call(sec.querySelectorAll('h3'),function(h){return !h.closest('aside');});el=hs[+o.anchor];}
    else el=document.getElementById(o.anchor);
  }
  if(el)el.scrollIntoView({block:o.find?'center':'start'});
}
setTimeout(go,60);setTimeout(go,900);
// Avancement de la lecture (pour cocher « lu » en fin de chapitre).
var sent=false;window.addEventListener('scroll',function(){
  var h=document.documentElement;var ratio=(h.scrollTop+innerHeight)/h.scrollHeight;
  post({type:'scroll',ratio:ratio});if(ratio>0.97&&!sent){sent=true;post({type:'end'});}
},{passive:true});
post({type:'ready'});
})();true;`;
