"use strict";
const $=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat("pt-BR").format(n??0),human=s=>String(s??"").replace(/[_-]/g," ").replace(/^./,c=>c.toUpperCase()),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),e=esc;
const tabs=[["overview","◈","Visão geral"],["combat","⚔","Combate"],["spells","✧","Grimório"],["inventory","▣","Inventário"],["mastery","◇","Maestrias"],["research","⌑","Pesquisas"],["knowledge","▤","Conhecimentos"],["quests","☷","Missões"],["relations","♧","Relações"],["maps","⌖","Mapas"]];
let D=null,C=new Map(),active="overview",busy=false,search="",filter="",signature="";
const text=(v)=>e(v||""),pill=v=>'<span class="pill">'+e(v)+'</span>',card=(title,body,extra="")=>'<article class="card '+extra+'"><h3>'+e(title)+'</h3>'+body+'</article>',p=v=>v?'<p>'+e(v)+'</p>':"",list=a=>a?.length?'<ul>'+a.map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>':"",details=(title,body)=>body?'<details><summary>'+e(title)+'</summary>'+body+'</details>':"",grid=a=>'<div class="grid">'+(a.join("")||'<p class="empty">Nenhum registro encontrado.</p>')+'</div>',stack=a=>'<div class="stack">'+a.join("")+'</div>',heading=s=>'<h3 class="subheading">'+e(s)+'</h3>',matches=(...v)=>v.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(search.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase());
function bar(n,v,m,color){return '<div class="stat"><div class="stat-head"><span>'+e(n)+'</span><span>'+Math.round(m?100*v/m:0)+'%</span></div><strong>'+fmt(v)+' <small>/ '+fmt(m)+'</small></strong><div class="track" role="progressbar" aria-label="'+e(n)+'" aria-valuenow="'+v+'" aria-valuemin="0" aria-valuemax="'+m+'"><div class="fill" style="background:var(--'+color+');width:'+Math.min(100,Math.max(0,m?100*v/m:0))+'%"></div></div></div>'}
function renderHero(){
 const h=D.personagem,r=h.recursos,a=h.atributos;
 $("name").textContent=h.nome;$("class").textContent=h.classe;$("heritage").textContent=h.heranca;$("version").textContent=D.checkpoint+" · C"+D.cena;
 $("quick").innerHTML='<span>Nível <b>'+e(h.nivel)+'</b></span><span class="gold">◆ '+fmt(r.ouro)+' G</span>';
 $("hero").innerHTML=bar("VIDA",r.hp,r.hp_max,"hp")+bar("MANA",r.mp,r.mp_max,"mp")+bar("ESFORÇO",r.pe,r.pe_max,"pe")+bar("XP",r.xp_nivel,r.xp_proximo_nivel,"xp");
 $("location").textContent=D.local+" · Dia "+D.dia+" · "+human(D.periodo);
 const attrs=[["for","Força"],["des","Destreza"],["int","Inteligência"],["res","Resistência"]];
 $("attributes").innerHTML='<div class="attribute-wheel"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="88"/><circle cx="120" cy="120" r="66"/><circle cx="120" cy="120" r="44"/><path d="M120 19 221 120 120 221 19 120Z M120 45 195 120 120 195 45 120Z M120 19V221 M19 120H221 M58 58L182 182 M58 182L182 58"/><path class="rune" d="M120 83 150 120 120 157 90 120Z M120 97 136 120 120 143 104 120Z"/></svg>'+attrs.map(([k,n])=>'<div class="attribute attr-'+k+'" title="'+e(n)+'"><small>'+k.toUpperCase()+'</small><b>'+e(a[k])+'</b><span>'+e(n)+'</span></div>').join("")+'</div><div class="defenses">'+[["DEF",a.def,"Defesa"],["RD",a.rd,"Redução física"],["INI",a.des,"Destreza"]].map(([k,v,n])=>'<div class="shield"><small>'+k+'</small><strong>'+e(v)+'</strong><span>'+n+'</span></div>').join("")+'</div><div class="side-info"><div class="side-line"><span>Recuperação PE</span><b>'+h.recuperacao.noites+'/'+h.recuperacao.necessarias+' noites</b></div><div class="side-line"><span>XP total</span><b>'+fmt(r.xp_total)+'</b></div><div class="side-line"><span>Pontos livres</span><b>'+a.pontos_livres+'</b></div><div class="side-line"><span>Rações / água</span><b>'+fmt(D.inventario.find(x=>x.id==="racao-viagem")?.quantidade)+' / '+fmt(D.agua.tratada)+' L</b></div><div class="side-line"><span>Poções de vida</span><b>'+fmt(D.inventario.find(x=>x.id==="pocao-vida")?.quantidade)+'</b></div></div><div class="side-notice"><b>Esforço</b><p>2 PE = +1 no teste · 5 PE = rerrolar falha pré-declarada.</p><p>Reserva atual: até +'+Math.floor(r.pe/2)+' ou '+Math.floor(r.pe/5)+' rerrolagem(ns).</p></div><div class="side-notice conditions"><b>Condições</b>'+h.condicoes.map(c=>'<details><summary>'+e(human(c.id))+' · '+e(human(c.status))+'</summary>'+p(c.efeito)+'</details>').join("")+'</div>';
 const ordered=[...D.maestrias].sort((x,y)=>y.grau-x.grau||x.nome.localeCompare(y.nome,"pt-BR"));$("master-count").textContent=ordered.length+" disciplinas";
 $("master-index").innerHTML='<div class="master-legend"><span>DISCIPLINA</span><span>GRAU / BÔNUS</span></div>'+ordered.map(x=>'<details class="master-row"><summary><span class="master-name">'+e(x.nome)+'</span><span class="master-level"><span class="master-dots" aria-label="Grau '+x.grau+'">'+[1,2,3,4,5].map(i=>'<i class="'+(i<=x.grau?"filled":"")+'"></i>').join("")+'</span><b>+'+e(x.bonus)+'</b></span></summary><div class="master-detail">'+p(x.titulo)+p(x.justificativa)+p(x.proximo_marco)+'</div></details>').join("");
}

function countFor(t){return {spells:D.magias.length+D.prototipos.length,inventory:D.inventario.length,mastery:D.maestrias.length,research:D.pesquisas.length,knowledge:D.descobertas.length,quests:D.missoes.length,relations:D.relacoes.length,maps:D.rota.length}[t]??""}
function navigate(t){if(!tabs.some(x=>x[0]===t))t="overview";active=t;search="";filter="";$("panel").innerHTML="";location.hash=t;renderNav();renderPanel()}
function renderNav(){$("nav").innerHTML=tabs.map(([id,icon,label])=>'<button type="button" data-tab="'+id+'" '+(active===id?'aria-current="page"':'')+'><span class="nav-icon" aria-hidden="true">'+icon+'</span>'+label+'<span class="nav-count">'+countFor(id)+'</span></button>').join("");$("nav").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.tab)))}
function toolbar(options){return '<div class="toolbar"><input id="search" type="search" aria-label="Buscar na seção" placeholder="Buscar…" value="'+e(search)+'">'+(options?.length?'<select id="filter" aria-label="Filtrar categoria"><option value="">Todas as categorias</option>'+options.map(([id,label])=>'<option value="'+e(id)+'" '+(filter===id?"selected":"")+'>'+e(label)+'</option>').join("")+'</select>':"")+'</div><div id="results"></div>'}
function accordion(name,meta,body,cls=""){return '<details class="entry '+cls+'" data-entry="'+e(name)+'"><summary><span class="entry-name">'+e(name)+'</span><span class="entry-meta">'+meta+'</span><span class="chev" aria-hidden="true"></span></summary><div class="entry-body">'+body+'</div></details>'}
function questClosed(x){return /^(quitad[ao]|conclu[ií]d[ao]|cancelad[ao]|encerrad[ao]|falh[ao]|expirad[ao])\b/i.test(String(x.status??"").trim());}
function workspaceView(tab){
 const h=D.personagem;
 const empty='<p class="empty">Nenhum registro nesta categoria.</p>';
 const row=(label,value)=>`<div class="line"><span>${e(label)}</span><b>${e(value)}</b></div>`;
 const group=(title,items)=>items.length?heading(title)+items.join(""):"";
 const lane=(id,title,body,count=null)=>`<section class="workspace-lane workspace-${e(id)}"><div class="workspace-heading"><h3>${e(title)}</h3>${count!==null?`<span>${e(count)}</span>`:""}</div><div class="workspace-scroll" data-lane="${e(id)}" tabindex="0" aria-label="${e(title)}">${body||empty}</div></section>`;
 const board=(...lanes)=>`<div class="workspace-board cols-${lanes.length}">${lanes.join("")}</div>`;
 const item=x=>accordion(x.nome||human(x.id),`<span class="entry-preview">${e(human(x.categoria||"item"))}</span>${x.equipado?pill("Equipado"):""}${pill("×"+x.quantidade)}`,p(x.descricao)+list(x.propriedades)+list(x.restricoes));
 const spell=x=>accordion(x.nome,pill(x.mp+(x.custo_variavel?"+":"")+" MP")+`<span class="entry-preview">${e(x.efeito?.match(/\d+ de dano[^ (]*|\+\d+\s*DEF|\d+\s*HP|\d+\s*(?:turnos|min)/i)?.[0]??"")}</span>`,p(x.efeito)+p(x.limite)+(x.aperfeicoamentos||[]).map(y=>p("+"+y.bonus_acerto+" acerto · "+y.condicao+" · "+y.limite)).join(""),"spell-entry");
 const proto=x=>accordion(x.nome,pill(human(x.status||"experimental"))+(x.custo_mp_estimado!=null?pill(x.custo_mp_estimado+" MP"):""),p(x.efeito)+p(x.observacao)+p(x.limite));
 const study=x=>{const pct=x.progresso?.match(/^(\d+)%/)?.[1];return accordion(x.nome,pct!=null?pill(pct+"%"):pill(human(x.categoria)),p(x.objetivo)+(pct!=null?bar("ESTUDO",Number(pct),100,"xp"):"")+p(x.progresso)+p(x.efeito_atual)+p(x.condicao_para_prosseguir));};
 const skill=x=>accordion(human(x.id),x.usos_disponiveis!=null?pill(x.usos_disponiveis+"/"+x.usos_por_descanso_longo+" usos"):"",p(x.condicao)+p(x.recuperacao_mp_max!=null?"Recuperação de até "+x.recuperacao_mp_max+" MP":null)+p(x.efeito));
 const masteryRow=x=>accordion(x.nome,pill("+"+x.bonus)+pill(["","I","II","III","IV","V"][x.grau]??String(x.grau)),p(x.titulo)+p(x.justificativa)+p("Próximo marco: "+x.proximo_marco));
 const quest=x=>accordion(x.nome,pill(x.ouro+" G")+pill(x.status),p(x.prazo!=null?"Prazo: Dia "+x.prazo:"Prazo não fixado")+row("Etapas",x.concluidas+"/"+x.etapas.length)+x.etapas.map((s,i)=>`<div class="line ${i<x.concluidas?"done":"pending"}"><span>${i<x.concluidas?"✓ ":"○ "}${e(s)}</span></div>`).join(""));
 const objectives=D.objetivos??[],studies=D.pesquisas??[],known=studies.filter(x=>/^concluida_validada/.test(x.categoria)),docs=studies.filter(x=>x.categoria==="estudo_documental"),ongoing=studies.filter(x=>!known.includes(x)&&!docs.includes(x));
 const studyMatch=x=>matches(x.nome,x.objetivo,x.categoria,x.progresso);
 if(tab==="overview"){
   const activeQuests=D.missoes.filter(x=>!questClosed(x));
   return board(lane("status","Situação atual",card("Local e momento",p(D.local)+p("Dia "+D.dia+" · "+human(D.periodo)))+card("Última cena",p(D.retomada))+card("Condições",h.condicoes.map(x=>accordion(human(x.id),pill(human(x.status)),p(x.efeito))).join(""))),lane("supplies","Suprimentos e posse",card("Recursos de viagem",row("Água tratada",fmt(D.agua.tratada)+" L")+row("Água não tratada",fmt(D.agua.bruta)+" L")+row("Rações",fmt(D.inventario.find(x=>x.id==="racao-viagem")?.quantidade))+row("Poções de vida",fmt(D.inventario.find(x=>x.id==="pocao-vida")?.quantidade))+row("Cavalos próprios",D.cavalos))+card("Itens ausentes",list(D.ausentes))+card("Equipados",D.inventario.filter(x=>x.equipado).map(item).join("")||empty)),lane("priority","Próximos passos",group("Missões em aberto",activeQuests.map(quest))+group("Objetivos pessoais",objectives.map(x=>accordion(x.nome,"",p(x.texto))))+group("Habilidades",h.habilidades.map(skill))+group("Aperfeiçoamentos",h.aperfeicoamentos.map(skill))));
 }
 if(tab==="spells"){
   const a=D.magias.filter(x=>(!filter||filter==="permanente")&&matches(x.nome,x.efeito)),b=D.prototipos.filter(x=>(!filter||filter==="prototipo")&&matches(x.nome,x.observacao,x.efeito));
   const offensive=new Set(["projetil-arcano","chama-errante","corte-runico","corte-da-chama-vazia","lanca-de-chama-negra-i"]);
   const attack=a.filter(x=>offensive.has(x.id)),other=a.filter(x=>!offensive.has(x.id));
   return board(lane("offensive","Magias ofensivas",attack.map(spell).join(""),attack.length),lane("utility","Magias de proteção e utilidade",other.map(spell).join(""),other.length),lane("prototype","Protótipos experimentais",b.length?'<p class="notice">Ensaios e técnicas experimentais; não equivalem a magias permanentes.</p>'+b.map(proto).join(""):"",b.length));
 }
 if(tab==="inventory"){
   const all=D.inventario.filter(x=>(!filter||x.categoria===filter)&&matches(x.nome,x.id,x.descricao,x.categoria));
   const evidence=all.filter(x=>/evidencia|arqueolog/i.test(x.categoria)),paper=all.filter(x=>/^(documentos?|chave|mapa)$/.test(x.categoria)),gear=all.filter(x=>!evidence.includes(x)&&!paper.includes(x));
   const arcane=gear.filter(x=>/artefato|grimorio|material/.test(x.categoria)&&!x.equipado),equipped=gear.filter(x=>x.equipado),ordinary=gear.filter(x=>!arcane.includes(x)&&!equipped.includes(x));
   const contracts=paper.filter(x=>/contrato|recibo|ordem de servi/i.test(x.nome)),otherPaper=paper.filter(x=>!contracts.includes(x));
   return board(lane("gear","Equipamentos e recursos",group("Equipados",equipped.map(item))+group("Suprimentos e ferramentas",ordinary.map(item))+group("Grimórios e artefatos",arcane.map(item)),gear.length),lane("evidence","Evidências arqueológicas",evidence.map(item).join(""),evidence.length),lane("documents","Documentos e pertences",group("Contratos e recibos",contracts.map(item))+group("Registros e outros pertences",otherPaper.map(item)),paper.length));
 }
 if(tab==="mastery"){
   const all=D.maestrias.filter(x=>(!filter||String(x.grau)===filter)&&matches(x.nome,x.titulo,x.justificativa)).sort((a,b)=>b.grau-a.grau||a.nome.localeCompare(b.nome,"pt-BR"));
   const high=all.filter(x=>x.grau>=3),mid=all.filter(x=>x.grau===2),low=all.filter(x=>x.grau<2);
   return board(lane("advanced","Mestres e superiores",high.map(masteryRow).join(""),high.length),lane("intermediate","Estudiosos",mid.map(masteryRow).join(""),mid.length),lane("novice","Aprendizes e iniciantes",low.map(masteryRow).join(""),low.length));
 }
 if(tab==="research"){
   const select=a=>a.filter(x=>(!filter||x.categoria===filter)&&studyMatch(x));
   const a=select(ongoing),b=select(docs),c=select(known);
   return board(lane("ongoing","Pesquisas e experimentos",a.map(study).join(""),a.length),lane("documents-study","Estudos documentais",b.map(study).join(""),b.length),lane("validated","Pesquisas validadas",c.map(study).join(""),c.length));
 }
 if(tab==="knowledge"){
   const discovery=(x,i)=>accordion("Descoberta "+String(i+1).padStart(2,"0"),"",p(x));
   const records=(D.descobertas??[]).map((x,i)=>({x,i})).reverse().filter(y=>matches(y.x));
   const theory=ongoing.filter(x=>/conhecimento|fundamentacao|limite_perceptivo|estudo_experimental/.test(x.categoria)&&studyMatch(x));
   const confirmed=known.filter(studyMatch);
   const improvements=h.aperfeicoamentos.filter(x=>matches(x.id,x.efeito)),abilities=h.habilidades.filter(x=>matches(x.id,x.condicao));
   return board(lane("discoveries","Descobertas registradas",records.map(y=>discovery(y.x,y.i)).join(""),records.length),lane("learning","Conhecimento validado",group("Estudos consolidados",confirmed.map(study))+group("Aperfeiçoamentos adquiridos",improvements.map(skill))+group("Habilidades",abilities.map(skill))),lane("theory","Teorias e limites conhecidos",theory.length?'<p class="notice">Conhecimento experimental ou teórico; não representa nova magia dominada.</p>'+theory.map(study).join(""):"",theory.length));
 }
 if(tab==="quests"){
   const open=D.missoes.filter(x=>!questClosed(x)),closed=D.missoes.filter(questClosed);
   return board(lane("active-quests","Missões em aberto",open.map(quest).join(""),open.length),lane("objectives","Objetivos pessoais",objectives.map(x=>accordion(x.nome,"",p(x.texto))).join(""),objectives.length),lane("quest-history","Histórico de missões",closed.map(quest).join(""),closed.length));
 }
 if(tab==="relations"){
   const close=D.relacoes.filter(x=>/companheir|amor|irm[aã]|fam[ií]li/.test(x.tipo.toLowerCase())),others=D.relacoes.filter(x=>!close.includes(x));
   const rel=x=>accordion(x.nome,pill(x.tipo),p(x.texto));
   return board(lane("close","Vínculos pessoais",close.map(rel).join(""),close.length),lane("contacts","Mentores e contatos",others.map(rel).join(""),others.length));
 }
 if(tab==="maps"){
   const current=D.rota.filter(x=>x.atual),visited=D.rota.filter(x=>!x.atual);
   const place=x=>card(x.nome,(x.atual?pill("Local atual"):"")+p(x.texto),x.atual?"current":"");
   const gallery=[["arven.webp","Planta parcial de Arven"],["lumeria.webp","Mapa urbano de Luméria"],["estrada.webp","Estrada Pedravale–Luméria"]].map(([file,title])=>`<figure class="card map-card"><a href="assets/${file}" target="_blank" rel="noopener"><img loading="lazy" src="assets/${file}" alt="${e(title)}"></a><figcaption>${e(title)}</figcaption></figure>`).join("");
   return board(lane("route","Local e percurso",group("Local atual",current.map(place))+group("Locais registrados",visited.map(place))),lane("maps","Mapas canônicos",'<p class="notice">Representações ilustrativas, sem escala ou orientação cardinal confirmada.</p>'+gallery,3));
 }
 return empty;
}
const filters={knowledge:()=>[],spells:()=>[["permanente","Magias permanentes"],["prototipo","Protótipos"]],inventory:()=>[...new Set([...C.values()].map(x=>x.categoria))].sort().map(x=>[x,human(x)]),mastery:()=>[["5","Ancião V"],["4","Veterano IV"],["3","Mestre III"],["2","Estudioso II"],["1","Aprendiz I"]],research:()=>[...new Set(D.pesquisas.map(x=>x.categoria))].map(x=>[x,human(x)])};
const renders=Object.fromEntries(tabs.map(([id])=>[id,id==="combat"?()=>combatView(D):()=>workspaceView(id)]));
function renderPanel(){
 if(!D)return;
 const panel=$("panel"),previous=panel.querySelector(".workspace-results,.combat-results"),oldTop=previous?.scrollTop||0;
 const laneTops=new Map([...panel.querySelectorAll("[data-lane]")].map(x=>[x.dataset.lane,x.scrollTop]));
 const opened=new Set([...panel.querySelectorAll("details[data-entry][open]")].map(x=>x.dataset.entry));
 const focusSearch=document.activeElement?.id==="search";
 $("section-title").textContent=tabs.find(x=>x[0]===active)[2];
 $("section-count").textContent=countFor(active)?countFor(active)+" registros":"";
 $("content").classList.toggle("combat-mode",active==="combat");
 $("content").classList.add("workspace-mode");
 if(active==="combat"){panel.innerHTML='<div class="combat-results" aria-label="Categorias de combate">'+renders.combat()+'</div>';restore(panel.querySelector(".combat-results"));return}
 const label=e(tabs.find(x=>x[0]===active)[2]),hasSearch=!!filters[active];
 panel.innerHTML=(hasSearch?toolbar(filters[active]()).replace('<div id="results"></div>',''):"")+'<div class="workspace-results" aria-label="'+label+'"></div>';
 const result=panel.querySelector(".workspace-results");
 function restore(el){el.querySelectorAll("details[data-entry]").forEach(x=>{if(opened.has(x.dataset.entry))x.open=true});el.querySelectorAll("[data-lane]").forEach(x=>{x.scrollTop=laneTops.get(x.dataset.lane)||0});el.scrollTop=oldTop}
 const refresh=(keep=false)=>{result.innerHTML=renders[active]();if(keep)restore(result);else result.scrollTop=0};
 if(hasSearch){$("search").addEventListener("input",ev=>{search=ev.target.value;refresh()});$("filter")?.addEventListener("change",ev=>{filter=ev.target.value;refresh()})}
 refresh(true);if(focusSearch&&hasSearch)$("search").focus({preventScroll:true});
}
async function getJSON(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error(path+" · HTTP "+r.status);return r.json()}
async function load(force=false){if(busy)return;busy=true; $("refresh").disabled=true;try{const next=await getJSON("data.json");if(next.schema!==1||!next.personagem||!next.inventario)throw Error("Formato de ficha incompatível");if(force||JSON.stringify(next)!==signature){const map=new Map(next.inventario.map(x=>[x.id,x]));if(next.inventario.some(x=>!x.nome))throw Error("Catálogo incompleto; atualização ainda não publicada");D=next;C=map;signature=JSON.stringify(next);renderHero();renderNav();renderPanel()}$("sync-status").textContent=D.checkpoint+" · Sincronizado";$("sync-status").parentElement.classList.remove("error")}catch(err){$("sync-status").textContent="Falha ao atualizar";$("sync-status").parentElement.classList.add("error");if(!D)$("panel").innerHTML='<p class="error-box">'+e(err.message)+' · Confira a publicação e tente Atualizar.</p>'}finally{busy=false;$("refresh").disabled=false}}
$("refresh").addEventListener("click",()=>load(true));const initial=location.hash.slice(1);if(tabs.some(x=>x[0]===initial))active=initial;window.addEventListener("hashchange",()=>{const t=location.hash.slice(1);if(t!==active&&tabs.some(x=>x[0]===t)){active=t;search="";filter="";$("panel").innerHTML="";if(D){renderNav();renderPanel()}}});load(true);setInterval(()=>{if(!document.hidden)load()},20000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
