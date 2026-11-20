"use strict";
window.LiliaTribute = (() => {
  const profiles = [
    ["X · @Karly_Lilia", "https://x.com/Karly_Lilia"],
    ["小红书", "https://www.rednote.com/user/profile/63b593a0000000002702a9c9"]
  ];
  const words = {
    zh:{dedication:"仅以本站纪念我们永远的朋友，我的狸狸亚",photo:"Kig是永恒的美少女，每个灰姑娘都会穿上自己的水晶鞋",writing:"你是个理想主义者，且永远都是"},
    en:{dedication:"In memory of our forever friend, my Lilia.",photo:"A Kig girl stays beautiful forever. Every Cinderella will wear her own glass slippers.",writing:"You are an idealist, and you always will be."}
  };
  const verses = [
    [48,"The stars are not afraid to appear like fireflies.","群星不怕看起来像萤火虫。"],
    [95,"Be still, my heart, these great trees are prayers.","静下来吧，我的心，这些参天大树都是祈祷。"],
    [35,"The bird wishes it were a cloud.","鸟儿想成为一朵云。"]
  ];
  const intro={
    zh:"本站归档狸狸亚的角色装扮、漫展和日常\n纪念我们永远的朋友，我的狸狸亚",
    en:"This site archives Lilia’s cosplay, conventions and everyday life.\nIn memory of our forever friend, my Lilia."
  };
  const adminHref="mailto:yangjhin233@gmail.com";
  function admin(target,lang){
    if(!target)return;
    target.hidden=!adminHref;
    if(!adminHref)return;
    target.textContent=lang.startsWith("zh")?"联系管理员":"Contact the organizer";
    target.href=adminHref;
    target.title=adminHref.replace(/^mailto:/,"");
    target.setAttribute("aria-label",target.textContent+" · "+target.title);
    if(adminHref.startsWith("https:")){target.target="_blank";target.rel="noopener noreferrer";}
  }
  function heading(target,lang,kind){
    target.textContent=words[lang.startsWith("zh")?"zh":"en"][kind]||"";
    target.hidden=!target.textContent;
  }
  function identity(target,lang){
    target.replaceChildren(document.createTextNode("咔帕噗狸狸亚"));
    for(const [name,url] of profiles){
      target.append(document.createTextNode(" · "));
      const link=document.createElement("a");link.textContent=name==="小红书"&&!lang.startsWith("zh")?"Rednote · 小红书":name;
      link.href=url;link.target="_blank";link.rel="noopener noreferrer";target.append(link);
    }
  }
  function show(target, lang, kind, key) {
    if (!target) return;
    const zh = lang.startsWith("zh"), text=words[zh?"zh":"en"];
    const el=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;return e;};
    target.className="memorial-footer";target.replaceChildren();
    let hash=0;
    for(const ch of String(key))hash=(Math.imul(hash,31)+ch.codePointAt(0))>>>0;
    const [number,en,cn]=verses[hash%verses.length];
    const poem=el("blockquote",zh?cn:en);
    const credit=el("a",zh?"泰戈尔《飞鸟集》 · 第"+number+"首":"Rabindranath Tagore · Stray Birds, "+number);
    credit.href="https://en.wikisource.org/wiki/Stray_Birds";credit.target="_blank";credit.rel="noopener noreferrer";
    const cite=el("cite","");cite.append(credit);poem.append(cite);target.append(poem);
  }
  function entryLinks(dialog, open) {
    const remote=location.protocol.startsWith("http");
    const fromURL=()=>{
      const params=new URLSearchParams(location.search);
      const page=Number(params.get("image"));
      if(params.has("entry"))open(params.get("entry"),Number.isSafeInteger(page)&&page>0?page-1:0);
      else if(dialog.open)dialog.close();
    };
    function mark(id,image){
      if(!remote)return;
      const url=new URL(location.href),before=url.searchParams.get("entry");
      url.searchParams.set("entry",id);url.searchParams.set("image",String(image+1));
      if(!before)history.pushState({memorialEntry:true},"",url);
      else if(url.href!==location.href)history.replaceState(history.state,"",url);
    }
    dialog.addEventListener("close",()=>{
      if(!remote)return;
      const url=new URL(location.href);
      if(!url.searchParams.has("entry"))return;
      if(history.state?.memorialEntry){history.back();return;}
      url.searchParams.delete("entry");url.searchParams.delete("image");history.replaceState(null,"",url);
    });
    window.addEventListener("popstate",fromURL);
    return {mark,fromURL};
  }
  return {show,entryLinks,heading,identity,intro,admin};
})();
