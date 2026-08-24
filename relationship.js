(function(){
"use strict";
var REL_STORAGE="clarity_v0_relationship_state",HISTORY="clarity_v0_history";
var OTHER=["clarity_v0_state","clarity_v0_confidence_state","clarity_v0_procrastination_state","clarity_v0_lost_state","clarity_v0_rumination_state","clarity_v0_limits_state","clarity_v0_failure_state","clarity_v0_motivation_state"];
var active=false,stepIndex=0,data={};
var steps=["intro","relation","burden","event","map","need","safety","request","expressed","control","balance","boundary","direction","branch","sixmonths","action","summary"];
var relations=["Couple / relation intime","Famille","Amitié","Travail / études","Connaissance / voisinage","Autre"];
var needs=["Respect","Écoute","Fiabilité","Espace / autonomie","Affection / proximité","Équité","Sécurité","Clarté","Soutien","Reconnaissance"];
var trends=["Ça s’améliore","C’est plutôt stable","Ça se dégrade","Ça alterne beaucoup","Je ne sais pas"];
var directions=[
 {id:"repair",label:"Réparer",hint:"J’ai envie d’essayer une discussion ou un changement concret."},
 {id:"adjust",label:"Ajuster",hint:"Je veux changer mes attentes, ma disponibilité ou ma manière d’être dans cette relation."},
 {id:"distance",label:"Prendre de la distance",hint:"J’ai besoin de réduire l’exposition ou la place que cette relation prend."},
 {id:"unsure",label:"Je ne sais pas encore",hint:"Je veux surtout observer et obtenir une information nouvelle."}
];
function esc(s){return String(s||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
function nav(disabled){return '<div class="navrow"><button class="secondary" id="relBack" '+(disabled?'disabled':'')+'>Retour</button><button class="cta" id="relNext">Continuer</button></div>';}
function item(t,v){return '<div class="summary-item"><b>'+esc(t)+'</b><span>'+esc(v||"—")+'</span></div>';}
function fmtDate(iso){if(!iso)return "";return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});}
function history(){try{return JSON.parse(localStorage.getItem(HISTORY)||"[]")}catch(e){return[]}}
function noOther(){return OTHER.every(function(k){return !localStorage.getItem(k)})}
function clearOthers(){OTHER.forEach(function(k){localStorage.removeItem(k)})}
function isSafety(){return data.safety&&data.safety!=="Non"}
function read(){try{var raw=localStorage.getItem(REL_STORAGE);if(!raw)return false;var s=JSON.parse(raw);data=s.data||{};stepIndex=Number.isInteger(s.step)?s.step:0;if(stepIndex<0||stepIndex>=steps.length)stepIndex=0;return true}catch(e){return false}}
function save(){localStorage.setItem(REL_STORAGE,JSON.stringify({data:data,step:stepIndex}));showResume();}
function clear(){localStorage.removeItem(REL_STORAGE);data={};stepIndex=0;}
function showResume(){if(!noOther())return;var c=document.getElementById("resumeCard"),t=document.getElementById("resumeText");if(!c||!t)return;c.classList.remove("hidden");t.textContent=data.burden?"Tu travaillais sur une relation autour de : « "+data.burden+" »":"Tu as un parcours La Carte de la relation en cours.";}
function sticky(){var t=document.querySelector(".topbar");if(t)document.documentElement.style.setProperty("--topbar-h",t.offsetHeight+"px");}
function start(fresh){if(fresh){clearOthers();clear()}else read();document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});document.getElementById("flow").classList.add("active");document.querySelector(".bottom").classList.add("hidden");document.getElementById("resetBtn").classList.remove("hidden");document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active")});active=true;render();}
function directionLabel(){var d=directions.find(function(x){return x.id===data.direction});return d?d.label:"—";}
function requestSentence(){var fact=data.fact||"Quand cette situation arrive",need=data.primaryNeed||data.needText||"j’ai besoin que cela change",req=data.request||"";return fact+". Pour moi, "+need.toLowerCase()+" est important. "+(req?req:"Je voudrais te demander un changement concret.");}
function branchCopy(){if(isSafety())return {title:"Sécurité et soutien",q:"Quel prochain pas peut augmenter ta sécurité ou ton soutien sans provoquer de confrontation directe ?",ph:"Ex. en parler à une personne de confiance dans un moment sûr, préparer un endroit où aller, demander un conseil professionnel…"};
 if(data.direction==="repair")return {title:"Réparer",q:"Quelle conversation ou quel changement concret veux-tu tester une fois ?",ph:"Ex. demander 20 minutes pour parler d’un comportement précis et formuler une demande observable…"};
 if(data.direction==="adjust")return {title:"Ajuster",q:"Qu’est-ce que tu peux changer de ton côté sans attendre que l’autre change d’abord ?",ph:"Ex. répondre moins vite, moins me confier sur ce sujet, réduire mes attentes…"};
 if(data.direction==="distance")return {title:"Prendre de la distance",q:"À quoi ressemblerait une distance proportionnée et concrète ?",ph:"Ex. moins de messages, voir la personne moins souvent, ne plus discuter de certains sujets…"};
 return {title:"Observer",q:"Quelle information te manque pour savoir dans quelle direction aller ?",ph:"Ex. voir si une demande claire est respectée, observer comment je me sens après nos échanges…"};}
function proposedAction(){return data.branch||data.request||data.boundary||"";}
function render(){
 var step=steps[stepIndex],host=document.getElementById("flowContent"),flow=document.getElementById("flow");
 flow.classList.toggle("sticky-question",step!=="intro"&&step!=="summary");
 document.getElementById("progress").style.width=Math.round(stepIndex/(steps.length-1)*100)+"%";
 if(step==="intro")host.innerHTML='<div class="hero"><div class="eyebrow">La Carte de la relation</div><h2>Une relation peut peser sans qu’il soit nécessaire de coller une étiquette sur l’autre personne.</h2><p>On va distinguer ce qui s’est passé, ce que tu en conclus, ce dont tu as besoin et ce que tu peux réellement demander ou changer.</p></div><div class="card soft-green"><b>Objectif</b><p>Passer d’un malaise relationnel diffus à une direction : réparer, ajuster, prendre de la distance ou observer davantage — sans décider à ta place.</p></div>'+nav(true);
 if(step==="relation")host.innerHTML='<div class="hero"><div class="eyebrow">1 · La relation</div><h2>De quel type de relation s’agit-il&nbsp;?</h2></div><div class="choices">'+relations.map(function(x){return '<button class="choice '+(data.relation===x?'selected':'')+'" data-rel-relation="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 if(step==="burden")host.innerHTML='<div class="hero"><div class="eyebrow">2 · Ce qui pèse</div><h2>Qu’est-ce qui te pèse le plus dans cette relation aujourd’hui&nbsp;?</h2><p class="muted">Une phrase suffit. On précisera ensuite.</p></div><div class="field"><textarea id="relBurden" placeholder="Ex. J’ai l’impression que mes besoins passent toujours après les siens…">'+esc(data.burden||"")+'</textarea></div>'+nav(false);
 if(step==="event")host.innerHTML='<div class="hero"><div class="eyebrow">3 · Un exemple récent</div><h2>Quel événement récent illustre le mieux ce problème&nbsp;?</h2><p class="muted">Décris seulement ce qu’une caméra ou un témoin aurait pu observer.</p></div><div class="field"><label>Ce qui s’est passé</label><textarea id="relFact" placeholder="Ex. Nous avions rendez-vous à 19 h. La personne est arrivée à 20 h 15 sans message.">'+esc(data.fact||"")+'</textarea></div>'+nav(false);
 if(step==="map")host.innerHTML='<div class="hero"><div class="eyebrow">4 · La Carte de la relation</div><h2>Sépare les faits de ce que la situation provoque chez toi.</h2></div><div class="card soft-green"><div class="field"><label>Faits observables</label><textarea id="relFacts" placeholder="Ce qui a réellement été dit ou fait…">'+esc(data.facts||data.fact||"")+'</textarea></div></div><div class="card coral"><div class="field"><label>Ce que j’interprète</label><textarea id="relStory" placeholder="Ex. je ne compte pas pour cette personne, elle s’en fiche…">'+esc(data.story||"")+'</textarea></div></div><div class="card cream"><div class="field"><label>Ce que je ressens</label><textarea id="relFeel" placeholder="Ex. déçu(e), en colère, anxieux(se), triste…">'+esc(data.feelings||"")+'</textarea></div></div><div class="card"><div class="field"><label>Ce dont j’aurais besoin</label><textarea id="relNeedText" placeholder="Ex. plus de fiabilité, de considération, d’espace…">'+esc(data.needText||"")+'</textarea></div></div>'+nav(false);
 if(step==="need")host.innerHTML='<div class="hero"><div class="eyebrow">5 · Le besoin principal</div><h2>Quel besoin est le plus important dans cette situation&nbsp;?</h2></div><div class="chips">'+needs.map(function(x){return '<button class="chip '+(data.primaryNeed===x?'selected':'')+'" data-rel-need="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 if(step==="safety")host.innerHTML='<div class="hero"><div class="eyebrow">6 · Vérification de sécurité</div><h2>Est-ce que cette relation comporte peur, menaces, violence, intimidation ou contrôle important&nbsp;?</h2><p class="muted">Si oui ou si tu as un doute, Clarity ne proposera pas de confrontation directe.</p></div><div class="choices">'+["Non","Oui","Je ne sais pas / j’ai un doute"].map(function(x){return '<button class="choice '+(data.safety===x?'selected':'')+'" data-rel-safety="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 if(step==="request"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">7 · Sécurité d’abord</div><h2>Qu’est-ce qui augmenterait un peu ta sécurité ou ta marge de manœuvre aujourd’hui&nbsp;?</h2></div><div class="notice">Quand tu crains une réaction violente, menaçante ou très contrôlante, une confrontation directe peut augmenter le risque. Si tu es en danger immédiat, privilégie un lieu sûr et les services d’urgence locaux.</div><div class="field"><textarea id="relSafeNeed" placeholder="Ex. ne pas rester seul(e), avoir un endroit où aller, en parler à une personne de confiance…">'+esc(data.safeNeed||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">7 · La demande concrète</div><h2>Quel changement observable aimerais-tu demander&nbsp;?</h2><p class="muted">Évite “sois plus attentionné(e)”. Cherche quelque chose qu’on pourrait constater.</p></div><div class="field"><textarea id="relRequest" placeholder="Ex. Si tu es en retard de plus de 15 minutes, envoie-moi un message.">'+esc(data.request||"")+'</textarea></div><div class="card cream"><b>Formulation possible</b><p>'+esc(requestSentence())+'</p></div>'+nav(false);
 }
 if(step==="expressed"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">8 · Ne pas porter ça seul(e)</div><h2>Qui pourrait être un appui sans t’exposer davantage&nbsp;?</h2></div><div class="field"><textarea id="relSupport" placeholder="Une personne de confiance, un professionnel, un lieu, une organisation…">'+esc(data.support||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">8 · Ce qui a déjà été tenté</div><h2>As-tu déjà exprimé clairement ce besoin ou cette demande&nbsp;?</h2></div><div class="choices">'+["Non","Oui, une fois","Oui, plusieurs fois","Pas aussi clairement"].map(function(x){return '<button class="choice '+(data.expressed===x?'selected':'')+'" data-rel-expressed="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+((data.expressed==="Oui, plusieurs fois")?'<div class="insight">Si une demande claire a été répétée et qu’aucun changement durable n’apparaît, c’est une information sur la relation — pas seulement un problème de formulation.</div>':'')+nav(false);
 }
 if(step==="control")host.innerHTML='<div class="hero"><div class="eyebrow">9 · Ce qui dépend de qui</div><h2>Sépare ce que tu peux décider de ce que tu ne peux pas décider pour l’autre.</h2></div><div class="card soft-green"><div class="field"><label>Ça dépend de moi</label><textarea id="relMine" placeholder="Ce que je dis, ce que j’accepte, ma disponibilité, partir, demander de l’aide…">'+esc(data.mine||"")+'</textarea></div></div><div class="card coral"><div class="field"><label>Ça dépend de l’autre</label><textarea id="relTheirs" placeholder="Comprendre, être d’accord, changer, s’excuser, respecter une demande…">'+esc(data.theirs||"")+'</textarea></div></div>'+nav(false);
 if(step==="balance"){
  var gives=Number(data.gives||0),costs=Number(data.costs||0);
  host.innerHTML='<div class="hero"><div class="eyebrow">10 · Ce que cette relation apporte et coûte</div><h2>Sans résumer toute la relation à un chiffre, où en es-tu aujourd’hui&nbsp;?</h2></div><div class="card soft-green"><h3>Ce que cette relation m’apporte</h3><div class="chips">'+[1,2,3,4,5].map(function(n){return '<button class="chip '+(gives===n?'selected':'')+'" data-rel-gives="'+n+'">'+n+'</button>'}).join("")+'</div><p class="muted">1 = très peu · 5 = beaucoup</p></div><div class="card coral"><h3>Ce qu’elle me coûte</h3><div class="chips">'+[1,2,3,4,5].map(function(n){return '<button class="chip '+(costs===n?'selected':'')+'" data-rel-costs="'+n+'">'+n+'</button>'}).join("")+'</div><p class="muted">1 = très peu · 5 = beaucoup</p></div><h3>Sur les derniers mois, la tendance est plutôt…</h3><div class="choices">'+trends.map(function(x){return '<button class="choice '+(data.trend===x?'selected':'')+'" data-rel-trend="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 }
 if(step==="boundary"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">11 · Ta marge de manœuvre</div><h2>Quelle limite peux-tu appliquer de ton côté sans annoncer une confrontation&nbsp;?</h2><p class="muted">Par exemple : ne pas rester seul(e), limiter certaines informations, préparer une sortie, choisir quand répondre.</p></div><div class="field"><textarea id="relBoundary" placeholder="Ex. Je ne reste pas seul(e) avec cette personne quand la tension monte…">'+esc(data.boundary||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">11 · Ta limite</div><h2>Si rien ne change, quelle limite dépend de toi&nbsp;?</h2><p class="muted">Une limite décrit ce que toi tu feras, pas ce que tu obligeras l’autre à faire.</p></div><div class="field"><textarea id="relBoundary" placeholder="Ex. Si les retards sans message continuent, je n’attendrai plus au-delà de 20 minutes.">'+esc(data.boundary||"")+'</textarea></div>'+nav(false);
 }
 if(step==="direction"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">12 · Priorité</div><h2>Quelle priorité semble la plus sûre maintenant&nbsp;?</h2></div><div class="choices">'+["Créer de la distance","Parler à une personne de confiance","Chercher un conseil professionnel","Identifier un endroit sûr","Gagner du temps sans confrontation"].map(function(x){return '<button class="choice '+(data.safePriority===x?'selected':'')+'" data-rel-safe-priority="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">12 · Direction</div><h2>Quelle direction mérite d’être testée maintenant&nbsp;?</h2><p class="muted">Ce choix n’est pas définitif.</p></div><div class="choices">'+directions.map(function(x){return '<button class="choice '+(data.direction===x.id?'selected':'')+'" data-rel-direction="'+x.id+'"><b>'+esc(x.label)+'</b><span class="muted" style="display:block;font-size:13px;margin-top:4px;font-weight:500">'+esc(x.hint)+'</span></button>'}).join("")+'</div>'+nav(false);
 }
 if(step==="branch"){var b=branchCopy();host.innerHTML='<div class="hero"><div class="eyebrow">13 · '+esc(b.title)+'</div><h2>'+esc(b.q)+'</h2></div><div class="field"><textarea id="relBranch" placeholder="'+esc(b.ph)+'">'+esc(data.branch||"")+'</textarea></div>'+nav(false)}
 if(step==="sixmonths")host.innerHTML='<div class="hero"><div class="eyebrow">14 · Si rien ne change</div><h2>Si cette relation restait exactement comme aujourd’hui pendant six mois, qu’est-ce que cela changerait pour toi&nbsp;?</h2><p class="muted">Cette question ne décide pas à ta place. Elle rend visible le coût du statu quo.</p></div><div class="field"><textarea id="relSixMonths" placeholder="Ex. je serais plus distant(e), épuisé(e), résigné(e), ou au contraire je pourrais l’accepter…">'+esc(data.sixMonths||"")+'</textarea></div>'+nav(false);
 if(step==="action"){var p=proposedAction();host.innerHTML='<div class="hero"><div class="eyebrow">15 · Prochain pas</div><h2>'+(isSafety()?"Quel pas sûr vas-tu faire maintenant&nbsp;?":"Quel petit pas vas-tu tester dans cette relation&nbsp;?")+'</h2><p class="muted">Un pas assez concret pour produire une information ou protéger ce qui compte.</p></div><div class="card soft-green"><label>Mon prochain pas</label><input id="relAction" type="text" value="'+esc(data.action||p)+'" placeholder="Mon prochain pas"></div><div class="field"><label>Quand ? <span class="muted">(facultatif)</span></label><input id="relDate" type="date" value="'+esc(data.actionDate||"")+'"></div>'+nav(false)}
 if(step==="summary")host.innerHTML='<div class="hero"><div class="eyebrow">Ta Carte de la relation</div><h2>'+(isSafety()?"La priorité n’est pas de convaincre l’autre. C’est d’augmenter ta sécurité et tes appuis.":"Tu n’as pas besoin d’étiqueter la relation pour voir plus clairement ce qui s’y passe.")+'</h2></div><div class="summary-grid">'+item("Relation",data.relation)+item("Ce qui pèse",data.burden)+item("Faits",data.facts||data.fact)+item("Interprétation",data.story)+item("Besoin principal",data.primaryNeed||data.needText)+item("Ce qui dépend de toi",data.mine)+item("Ce qui dépend de l’autre",data.theirs)+item("Tendance",data.trend)+item("Ta limite",data.boundary)+item(isSafety()?"Priorité sûre":"Direction",isSafety()?data.safePriority:directionLabel())+item("Si rien ne change 6 mois",data.sixMonths)+'</div><div class="card soft-green"><div class="eyebrow">Prochain pas</div><h3>'+esc(data.action||"À définir")+'</h3><p>'+(data.actionDate?fmtDate(data.actionDate):"Sans date définie")+'</p></div><div class="insight">'+(isSafety()?"Une situation de peur ou de contrôle ne se résume pas à mieux communiquer. Le prochain pas doit d’abord éviter d’augmenter le risque.":"Une demande claire peut améliorer une relation. Mais si elle est répétée sans changement durable, ce résultat devient lui-même une information utile.")+'</div><button class="cta" id="relFinish">Enregistrer dans Mon parcours</button><div style="height:10px"></div><button class="secondary" id="relEdit">Modifier une réponse</button>';
 bind(step);updateNext(step);sticky();save();requestAnimationFrame(function(){window.scrollTo(0,0)});
}
function capture(step){function v(id){var e=document.getElementById(id);return e?e.value.trim():""}
 if(step==="burden")data.burden=v("relBurden");
 if(step==="event")data.fact=v("relFact");
 if(step==="map"){data.facts=v("relFacts");data.story=v("relStory");data.feelings=v("relFeel");data.needText=v("relNeedText")}
 if(step==="request"){if(isSafety())data.safeNeed=v("relSafeNeed");else data.request=v("relRequest")}
 if(step==="expressed"&&isSafety())data.support=v("relSupport");
 if(step==="control"){data.mine=v("relMine");data.theirs=v("relTheirs")}
 if(step==="boundary")data.boundary=v("relBoundary");
 if(step==="branch")data.branch=v("relBranch");
 if(step==="sixmonths")data.sixMonths=v("relSixMonths");
 if(step==="action"){data.action=v("relAction");data.actionDate=v("relDate")}
}
function valid(step){
 if(step==="relation")return !!data.relation;
 if(step==="burden")return !!data.burden;
 if(step==="event")return !!data.fact;
 if(step==="map")return !!data.facts&&!!data.story&&!!data.feelings&&!!data.needText;
 if(step==="need")return !!data.primaryNeed;
 if(step==="safety")return !!data.safety;
 if(step==="request")return isSafety()?!!data.safeNeed:!!data.request;
 if(step==="expressed")return isSafety()?!!data.support:!!data.expressed;
 if(step==="control")return !!data.mine&&!!data.theirs;
 if(step==="balance")return !!data.gives&&!!data.costs&&!!data.trend;
 if(step==="boundary")return !!data.boundary;
 if(step==="direction")return isSafety()?!!data.safePriority:!!data.direction;
 if(step==="branch")return !!data.branch;
 if(step==="sixmonths")return !!data.sixMonths;
 if(step==="action")return !!data.action;
 return true;
}
function updateNext(step){var n=document.getElementById("relNext");if(!n)return;capture(step);n.disabled=!valid(step);}
function only(sel,b){document.querySelectorAll(sel).forEach(function(x){x.classList.remove("selected")});b.classList.add("selected")}
function bind(step){
 var back=document.getElementById("relBack"),next=document.getElementById("relNext");
 if(back)back.onclick=function(){capture(step);if(stepIndex>0){stepIndex--;render()}};
 if(next)next.onclick=function(){capture(step);if(valid(step)){stepIndex++;render()}};
 document.querySelectorAll("[data-rel-relation]").forEach(function(b){b.onclick=function(){data.relation=b.dataset.relRelation;only("[data-rel-relation]",b);save();updateNext(step)}});
 document.querySelectorAll("[data-rel-need]").forEach(function(b){b.onclick=function(){data.primaryNeed=b.dataset.relNeed;only("[data-rel-need]",b);save();updateNext(step)}});
 document.querySelectorAll("[data-rel-safety]").forEach(function(b){b.onclick=function(){data.safety=b.dataset.relSafety;data.direction="";data.safePriority="";render()}});
 document.querySelectorAll("[data-rel-expressed]").forEach(function(b){b.onclick=function(){data.expressed=b.dataset.relExpressed;render()}});
 document.querySelectorAll("[data-rel-gives]").forEach(function(b){b.onclick=function(){data.gives=Number(b.dataset.relGives);render()}});
 document.querySelectorAll("[data-rel-costs]").forEach(function(b){b.onclick=function(){data.costs=Number(b.dataset.relCosts);render()}});
 document.querySelectorAll("[data-rel-trend]").forEach(function(b){b.onclick=function(){data.trend=b.dataset.relTrend;only("[data-rel-trend]",b);save();updateNext(step)}});
 document.querySelectorAll("[data-rel-direction]").forEach(function(b){b.onclick=function(){data.direction=b.dataset.relDirection;data.branch="";only("[data-rel-direction]",b);save();updateNext(step)}});
 document.querySelectorAll("[data-rel-safe-priority]").forEach(function(b){b.onclick=function(){data.safePriority=b.dataset.relSafePriority;data.branch="";only("[data-rel-safe-priority]",b);save();updateNext(step)}});
 document.querySelectorAll("#flow input,#flow textarea").forEach(function(x){x.addEventListener("input",function(){capture(step);save();updateNext(step)});x.addEventListener("change",function(){capture(step);save();updateNext(step)})});
 var finish=document.getElementById("relFinish");if(finish)finish.onclick=finishSession;
 var edit=document.getElementById("relEdit");if(edit)edit.onclick=function(){stepIndex=1;render()};
}
function finishSession(){var h=history();h.unshift({id:Date.now(),type:"relationship",createdAt:new Date().toISOString(),decision:data.burden||"Relation",priorities:[isSafety()?"Sécurité":(directionLabel()||"Relation")],action:data.action||"",actionDate:data.actionDate||"",learned:"",done:false,relation:data.relation||"",need:data.primaryNeed||"",trend:data.trend||"",direction:isSafety()?data.safePriority:data.direction,boundary:data.boundary||"",safety:!!isSafety()});localStorage.setItem(HISTORY,JSON.stringify(h));clear();active=false;document.querySelector('[data-tab="journey"]').click()}
document.querySelectorAll("[data-relationship-start]").forEach(function(b){b.addEventListener("click",function(){start(true)})});
var resume=document.getElementById("resumeBtn");if(resume)resume.addEventListener("click",function(e){if(noOther()&&localStorage.getItem(REL_STORAGE)){e.preventDefault();e.stopImmediatePropagation();start(false)}},{capture:true});
var reset=document.getElementById("resetBtn");if(reset)reset.addEventListener("click",function(e){if(active){e.preventDefault();e.stopImmediatePropagation();if(window.confirm("Recommencer ce parcours ? Tes réponses en cours seront effacées.")){clear();start(true)}}},{capture:true});
document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){active=false})});
window.addEventListener("resize",sticky);
if(read()&&noOther())showResume();
})();