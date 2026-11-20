"use strict";
const {posts,topics}=window.gallery;
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let lang=(params.get("lang") || navigator.language).toLowerCase().startsWith("zh")?"zh":"en";
const copy={
  en:{eyebrow:"The cosplay photographs",intro:"Remembering Lilia through the characters he brought to life and the conventions he loved. Each photograph is accompanied by his own words.",browse:"Browse the photographs",title:"The albums",names:"Character or name",places:"Place",events:"Event",all:"All",search:"Search captions",clear:"Clear filters",more:"Show more",close:"Close",prev:"Previous",next:"Next",full:"Open photograph",photo:"Photograph",credit:"Anby at Doll Weekend 14 · Photography and editing by @opkig",count:(p,n)=>p+" photo appearances across "+n+" posts",empty:"No photographs match these filters."},
  zh:{eyebrow:"角色扮演摄影集",intro:"在狸狸亚扮演过的角色和走过的漫展里，重温他的模样。照片旁保留了他当时写下的话。",browse:"翻看照片",title:"主题相册",names:"角色或名字",places:"地点",events:"活动",all:"全部",search:"搜索原文",clear:"清除筛选",more:"查看更多",close:"关闭",prev:"上一张",next:"下一张",full:"打开照片",photo:"照片",credit:"Doll Weekend 14 的安比 · 摄影与后期 @opkig",count:(p,n)=>n+" 篇动态，共收录 "+p+" 张次照片",empty:"没有找到符合筛选条件的照片。"}
};
const facets={names:["characters","works","mentions"],places:["places"],events:["events"]};
const keys=[...Object.keys(facets),"search"];
const cover=posts.find(p=>p.id==="2092726647875096856");
const t=()=>copy[lang];
const src=file=>"photos/"+file;
const normalize=s=>s.normalize("NFKC").toLocaleLowerCase();
const date=value=>value?new Intl.DateTimeFormat(lang==="en"?"en-GB":"zh-CN",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(value.slice(0,10)+"T12:00:00Z")):"";
const platform=p=>p.source==="小红书" && lang==="en" ? "Rednote":p.source;
let results=[],shown=0,active,index;
const entryLinks=LiliaTribute.entryLinks($("viewer"),(id,i)=>{
  const post=posts.find(p=>p.id===id);
  if(post)read(post,Math.min(post.media.length-1,i));
});
function make(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function currentURL(target){
  const url=new URL(location.href);url.searchParams.set("lang",target);
  for(const k of keys){if($(k).value)url.searchParams.set(k,$(k).value);else url.searchParams.delete(k);}
  return url;
}
function filter(){
  const query=normalize($("search").value.trim());
  results=posts.filter(p=>Object.keys(facets).every(k=>!$(k).value || p.topics.includes($(k).value)) && (!query || normalize([p.text,...p.topics.flatMap(k=>[topics[k].en,topics[k].zh])].join(" ")).includes(query)));
  $("reset").hidden=keys.every(k=>!$(k).value);
  $("count").textContent=results.length?t().count(results.reduce((n,p)=>n+p.media.length,0),results.length):t().empty;
  shown=0;$("grid").replaceChildren();more();
  if(location.protocol.startsWith("http"))history.replaceState(null,"",currentURL(lang));
  for(const l of ["en","zh"])$(l).href=currentURL(l);
  LiliaTribute.show($("page-tribute"),lang,"photo",keys.map(k=>$(k).value).join("|"));
}
function more(){
  const group=document.createDocumentFragment();
  for(const p of results.slice(shown,shown+24)){
    const b=make("button","","tile"), im=make("img");im.src=src(p.media[0]);im.alt="";im.loading="lazy";im.decoding="async";
    const excerpt=make("span",p.text || t().photo,"excerpt");excerpt.dir="auto";
    b.append(im,make("span",[date(p.date),platform(p),"× "+p.media.length].filter(Boolean).join(" · "),"meta"),excerpt);
    b.onclick=()=>read(p,0);group.append(b);
  }
  $("grid").append(group);shown=Math.min(shown+24,results.length);$("more").hidden=shown>=results.length;
}
function read(p,i){
  entryLinks.mark(p.id,i);
  active=p;index=i;$("large").src=src(p.media[i]);$("large").alt=t().photo+" "+(i+1)+" · "+date(p.date);
  $("full").href=src(p.media[i]);$("prev").disabled=i===0;$("next").disabled=i===p.media.length-1;$("paging").hidden=p.media.length<2;
  $("position").textContent=(i+1)+" / "+p.media.length;$("origin").textContent=[date(p.date),platform(p)].filter(Boolean).join(" · ");
  $("caption").textContent=p.text;$("tags").replaceChildren();
  let threadLink=$("photo-thread");
  if(!threadLink){threadLink=make("a");threadLink.id="photo-thread";$("full").after(threadLink);}
  threadLink.hidden=!p.thread;
  if(p.thread){
    threadLink.textContent=lang==="zh"?"阅读这篇动态的对话":"Read this conversation";
    threadLink.href="conversations.html?"+new URLSearchParams({lang,thread:p.thread});
  }
  for(const k of p.topics){const f=Object.keys(facets).find(key=>facets[key].includes(topics[k].group));const btn=make("button",topics[k][lang]);btn.onclick=()=>{for(const key of keys)$(key).value="";$(f).value=k;$("viewer").close();filter();$("collection").scrollIntoView();};$("tags").append(btn);}
  let footer=$("photo-tribute");
  if(!footer){footer=make("footer");footer.id="photo-tribute";$("viewer").append(footer);}
  LiliaTribute.show(footer,lang,"photo",p.id+"-"+i,false);
  if(!$("viewer").open)$("viewer").showModal();
}
function setup(values){
  const c=t();document.documentElement.lang=lang==="zh"?"zh-Hans":"en";
  document.title=lang==="zh"?"永远的狸狸亚":"Forever Lilia";
  for(const e of [$("title"),document.querySelector(".wordmark")]){e.replaceChildren();if(lang==="en")e.append("Forever ",make("i","Lilia"));else e.textContent=document.title;}
  for(const [id,k] of Object.entries({intro:"intro",browse:"browse",credit:"credit","collection-title":"title","names-label":"names","places-label":"places","events-label":"events","search-label":"search",reset:"clear",more:"more",close:"close",prev:"prev",next:"next",heading:"photo",full:"full"}))$(id).textContent=c[k];
  $("intro").textContent=LiliaTribute.intro[lang];
  LiliaTribute.identity($("identity"),lang);LiliaTribute.admin(document.querySelector("[data-admin]"),lang);
  LiliaTribute.heading($("photos-line"),lang,"photo");LiliaTribute.heading($("entry-line"),lang,"photo");
  $("thread-nav").href="conversations.html?lang="+lang;$("thread-nav").textContent=lang==="zh"?"对话串":"Conversations";
  $("cover").alt=c.credit;$("hero-open").setAttribute("aria-label",c.credit);
  for(const k of Object.keys(facets)){
    const select=$(k);select.replaceChildren(new Option(c.all,""));
    const opts=Object.entries(topics).filter(([,v])=>facets[k].includes(v.group)).sort(([,a],[,b])=>a[lang].localeCompare(b[lang],lang));
    for(const [id,v]of opts)select.add(new Option(v[lang],id));
  }
  for(const k of keys)$(k).value=values.get(k)||"";
  for(const l of ["en","zh"])$(l).setAttribute("aria-current",String(l===lang));
  filter();
}
$("hero-open").onclick=()=>read(cover,0);$("cover").src=src(cover.media[0]);
for(const k of keys)$(k).addEventListener(k==="search"?"input":"change",filter);
for(const l of ["en","zh"])$(l).onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const v=currentURL(l).searchParams;lang=l;setup(v);};
$("reset").onclick=()=>{for(const k of keys)$(k).value="";filter();};
$("more").onclick=more;$("close").onclick=()=>$("viewer").close();
$("prev").onclick=()=>{if(index>0)read(active,index-1);};$("next").onclick=()=>{if(index+1<active.media.length)read(active,index+1);};
$("viewer").onkeydown=e=>{if(e.key==="ArrowLeft")$("prev").click();if(e.key==="ArrowRight")$("next").click();};
setup(params);
entryLinks.fromURL();
