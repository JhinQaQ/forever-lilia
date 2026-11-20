"use strict";
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const lang=(params.get("lang")||navigator.language).startsWith("zh")?"zh":"en";
const w=(en,zh)=>lang==="zh"?zh:en;
document.documentElement.lang=w("en","zh-Hans");
const create=(tag,value,cls)=>{const e=document.createElement(tag);if(value)e.textContent=value;if(cls)e.className=cls;return e;};
const norm=s=>s.normalize("NFKC").toLowerCase();
const fmtDate=s=>s?s.slice(0,10):"";
const conversations=window.publicThreads;
const sourceOf=t=>t.source||"X";
const sourceName=s=>s==="小红书"?w("Rednote","小红书"):s;
const years=[...new Set(conversations.flatMap(t=>t.rows.map(r=>r.date?.slice(0,4)).filter(Boolean)))].sort().reverse();
const search=new Map(conversations.map(t=>[t,norm(t.rows.map(r=>[r.by,r.text].join(" ")).join("\n"))]));
$("blog-nav").href="blog.html?lang="+lang;$("blog-nav").textContent=w("Blog","博客");
const label=w("Conversations","对话串");
$("title").textContent=label;$("home").textContent=w("Forever Lilia","永远的狸狸亚");document.title=label+" · "+$("home").textContent;
$("home").href="index.html?lang="+lang;$("photos").href=$("home").getAttribute("href")+"#collection";$("photos").textContent=w("Photographs","照片");
LiliaTribute.heading($("thread-line"),lang,"writing");LiliaTribute.admin(document.querySelector("[data-admin]"),lang);
$("query-label").textContent=w("Search conversations","搜索对话");$("year-label").textContent=w("Year","年份");$("more").textContent=w("Show more","查看更多");
$("source-label").textContent=w("Platform","平台");
$("source").append(new Option(w("All platforms","全部平台"),""),...Array.from(new Set(conversations.map(sourceOf)),s=>new Option(sourceName(s),s)));
$("year").append(new Option(w("All years","全部年份"),""),...years.map(y=>new Option(y,y)));
let results=[],shown=0,selected=params.get("thread");
function sync(){
  const url=new URL(location.href);
  for(const [name,value] of [["lang",lang],["thread",selected],["q",$("query").value],["year",$("year").value],["source",$("source").value]]){
    if(value)url.searchParams.set(name,value);else url.searchParams.delete(name);
  }
  if(location.protocol.startsWith("http"))history.replaceState(null,"",url);
  for(const l of ["en","zh"]){const next=new URL(url);next.searchParams.set("lang",l);$(l).href=next;$(l).setAttribute("aria-current",String(lang===l));}
}
function add(t){
  const box=create("details","","exchange"),head=create("summary"),root=t.rows[0],body=create("div","","exchange-body");
  box.id="thread-"+t.id;
  head.append(create("small",[fmtDate(root.date),sourceName(sourceOf(t)),root.by,(t.rows.length-1)+w(" replies"," 条回复")].filter(Boolean).join(" · ")),create("strong",root.text));
  box.append(head,body);$("list").append(box);
  function fill(){
    if(body.childElementCount)return;
    const depths=new Map();
    for(const r of t.rows){
      const depth=r.parentId?(depths.get(r.parentId)||0)+1:0;depths.set(r.id,depth);
      const article=create("article","","reply-row"),meta=create("div","","byline");
      article.style.setProperty("--depth",Math.min(depth,4));
      let by=create("span",r.by);
      if(sourceOf(t)==="X"){
        by=create("a",r.by);by.href="https://x.com/i/status/"+r.id;by.target="_blank";by.rel="noopener noreferrer";
      }
      meta.append(by,create("time",fmtDate(r.date)));const line=create("p",r.text);line.dir="auto";article.append(meta,line);body.append(article);
    }
    if(sourceOf(t)==="小红书"){
      const album=create("a",w("View photographs from this note","查看这篇笔记的照片"));
      album.href="index.html?"+new URLSearchParams({lang,entry:t.id,image:"1"});body.append(album);
    }
    const footer=create("footer"); LiliaTribute.show(footer,lang,"writing",t.id);body.append(footer);
  }
  box.addEventListener("toggle",()=>{
    if(box.open){fill();selected=t.id;}
    else if(selected===t.id)selected=null;
    sync();
  });
  if(selected===t.id){fill();box.open=true;}
}
function more(){const chunk=results.slice(shown,shown+30);chunk.forEach(add);shown+=chunk.length;$("more").hidden=shown>=results.length;}
function filter(initial=false){
  if(!initial)selected=null;
  const q=norm($("query").value.trim()),year=$("year").value;
  results=conversations.filter(t=>(!$("source").value||sourceOf(t)===$("source").value)&&(!q||search.get(t).includes(q))&&(!year||t.rows.some(r=>r.date?.startsWith(year))));
  $("list").replaceChildren();shown=0;
  $("status").textContent=w(results.length+" archived conversations",results.length+" 组已归档对话");
  more();const pos=selected?results.findIndex(t=>t.id===selected):-1;while(pos>=shown)more();
  if(pos>=0)document.getElementById("thread-"+selected)?.scrollIntoView({block:"start"});
  LiliaTribute.show($("poem"),lang,"writing","conversations");sync();
}
$("query").value=params.get("q")||"";$("year").value=params.get("year")||"";
$("source").value=params.get("source")||"";
$("query").oninput=$("year").onchange=$("source").onchange=()=>filter();$("more").onclick=more;filter(true);
