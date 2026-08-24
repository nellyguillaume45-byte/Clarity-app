(function(){
"use strict";
var LIMITS_STORAGE="clarity_v0_limits_state",HISTORY="clarity_v0_history";
var OTHER=["clarity_v0_state","clarity_v0_confidence_state","clarity_v0_procrastination_state","clarity_v0_lost_state","clarity_v0_rumination_state"];
var active=false,stepIndex=0,data={};
var steps=["intro","context","current","cost","zones","protect","safety","consequence","control","phrase","tone","repeat","feasibility","action","summary"];
var relations=["Couple / relation intime","Famille","Amitié","Travail / études","Connaissance / voisinage","Autre"];
var tones=["Doux","Clair","Ferme"];
var safetyAnswers=["Non","Oui","Je ne sais pas / j’ai un doute"];
function esc(s){return String(s||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
function nav(disabled){return '<div class="navrow"><button class="secondary" id="limBack" '+(disabled?'disabled':'')+'>Retour</button><button class="cta" id="limNext">Continuer</button></div>';}
function item(t,v){return '<div class="summary-item"><b>'+esc(t)+'</b><span>'+esc(v||"—")+'</span></div>';}
function fmtDate(iso){if(!iso)return "";return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});}
function history(){try{return JSON.parse(localStorage.getItem(HISTORY)||"[]")}catch(e){return[]}}
function noOther(){return OTHER.every(function(k){return !localStorage.getItem(k)})}
function clearOthers(){OTHER.forEach(function(k){localStorage.removeItem(k)})}
function isSafety(){return data.safety&&data.safety!=="Non"}
function read(){try{var raw=localStorage.getItem(LIMITS_STORAGE);if(!raw)return false;var s=JSON.parse(raw);data=s.data||{};stepIndex=Number.isInteger(s.step)?s.step:0;if(stepIndex<0||stepIndex>=steps.length)stepIndex=0;return true}catch(e){return false}}
function save(){localStorage.setItem(LIMITS_STORAGE,JSON.stringify({data:data,step:stepIndex}));showResume();}
function clear(){localStorage.removeItem(LIMITS_STORAGE);data={};stepIndex=0;}
function showResume(){if(!noOther())return;var c=document.getElementById("resumeCard"),t=document.getElementById("resumeText");if(!c||!t)return;c.classList.remove("hidden");t.textContent=data.context?"Tu travaillais sur une limite autour de : « "+data.context+" »":"Tu as un parcours La Frontière personnelle en cours.";}
function sticky(){var t=document.querySelector(".topbar");if(t)document.documentElement.style.setProperty("--topbar-h",t.offsetHeight+"px");}
function start(fresh){if(fresh){clearOthers();clear()}else read();document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});document.getElementById("flow").classList.add("active");document.querySelector(".bottom").classList.add("hidden");document.getElementById("resetBtn").classList.remove("hidden");document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active")});active=true;render();}
function phrasePreview(){var when=data.whenPart||"Quand cette situation arrive",limit=data.limitPart||"je ne peux / ne veux pas continuer ainsi",offer=data.offerPart||"";var base=when+", "+limit+".";if(offer)base+=" "+offer+".";return base;}
function tonedPhrase(){var base=phrasePreview();if(data.tone==="Doux")return "Je préfère te le dire clairement : "+base.charAt(0).toLowerCase()+base.slice(1);if(data.tone==="Ferme")return base+" Je te demande de respecter cette limite.";return base;}
function suggestedAction(){if(isSafety())return data.safeStep||"Parler de la situation à une personne de confiance dans un moment sûr";return data.delivery||tonedPhrase();}
function render(){
 var step=steps[stepIndex],host=document.getElementById("flowContent"),flow=document.getElementById("flow");
 flow.classList.toggle("sticky-question",step!=="intro"&&step!=="summary");
 document.getElementById("progress").style.width=Math.round(stepIndex/(steps.length-1)*100)+"%";
 if(step==="intro")host.innerHTML='<div class="hero"><div class="eyebrow">La Frontière personnelle</div><h2>Poser une limite ne consiste pas à contrôler l’autre.</h2><p>On va préciser ce qui ne te convient plus, ce que tu veux protéger et ce qui dépend réellement de toi.</p></div><div class="card soft-green"><b>Objectif</b><p>Passer d’un malaise diffus à une limite concrète — ou, si la situation comporte peur ou danger, à un prochain pas centré sur la sécurité plutôt que sur la confrontation.</p></div>'+nav(true);
 if(step==="context")host.innerHTML='<div class="hero"><div class="eyebrow">1 · La situation</div><h2>Dans quelle situation as-tu du mal à poser une limite&nbsp;?</h2><p class="muted">Décris un exemple précis et choisis le type de relation.</p></div><div class="field"><label>La situation</label><textarea id="limContext" placeholder="Ex. Mon collègue m’écrit le soir et j’accepte presque toujours de répondre…">'+esc(data.context||"")+'</textarea></div><div class="choices">'+relations.map(function(x,i){return '<button class="choice '+(data.relation===x?'selected':'')+'" data-lim-relation="'+i+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 if(step==="current")host.innerHTML='<div class="hero"><div class="eyebrow">2 · Ce qui se passe aujourd’hui</div><h2>Que fais-tu actuellement alors que tu aimerais faire autrement&nbsp;?</h2></div><div class="field"><label>Mon comportement actuel</label><textarea id="limCurrent" placeholder="Ex. Je dis oui, je réponds tout de suite, je me justifie longtemps…">'+esc(data.current||"")+'</textarea></div>'+nav(false);
 if(step==="cost")host.innerHTML='<div class="hero"><div class="eyebrow">3 · Le coût</div><h2>Qu’est-ce que cette absence de limite te coûte&nbsp;?</h2><p class="muted">Temps, énergie, ressentiment, stress, argent, disponibilité…</p></div><div class="field"><textarea id="limCost" placeholder="Ex. Je finis mes soirées tendu(e) et j’ai l’impression de ne jamais déconnecter…">'+esc(data.cost||"")+'</textarea></div>'+nav(false);
 if(step==="zones")host.innerHTML='<div class="hero"><div class="eyebrow">4 · Ta frontière</div><h2>Classe la situation dans trois zones.</h2></div><div class="card soft-green"><div class="field"><label>Ça me convient</label><textarea id="limOkay" placeholder="Ce qui reste acceptable pour toi…">'+esc(data.okay||"")+'</textarea></div></div><div class="card cream"><div class="field"><label>Ça dépend</label><textarea id="limDepends" placeholder="Ce qui dépend du contexte, du moment ou de la fréquence…">'+esc(data.depends||"")+'</textarea></div></div><div class="card coral"><div class="field"><label>Ça ne me convient pas</label><textarea id="limNo" placeholder="Ce que tu ne veux plus accepter ou répéter…">'+esc(data.no||"")+'</textarea></div></div>'+nav(false);
 if(step==="protect")host.innerHTML='<div class="hero"><div class="eyebrow">5 · Ce que tu protèges</div><h2>Si cette limite était mieux respectée, qu’est-ce qu’elle protégerait chez toi&nbsp;?</h2><p class="muted">Ton temps, ton énergie, ton intimité, ton argent, ton repos, ta dignité, une relation…</p></div><div class="field"><textarea id="limProtect" placeholder="Ex. Mon temps de repos et le fait de ne pas être disponible en permanence…">'+esc(data.protect||"")+'</textarea></div>'+nav(false);
 if(step==="safety")host.innerHTML='<div class="hero"><div class="eyebrow">6 · Vérification de sécurité</div><h2>Est-ce que poser cette limite pourrait t’exposer à de la peur, des menaces, de la violence ou davantage de contrôle&nbsp;?</h2><p class="muted">Cette question change la suite du parcours. Clarity ne te poussera pas à une confrontation si elle peut augmenter le risque.</p></div><div class="choices">'+safetyAnswers.map(function(x){return '<button class="choice '+(data.safety===x?'selected':'')+'" data-lim-safety="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
 if(step==="consequence"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">7 · Sécurité d’abord</div><h2>Qu’est-ce qui te ferait te sentir un peu plus en sécurité aujourd’hui&nbsp;?</h2><p class="muted">Ne cherche pas à régler toute la relation. Cherche un appui qui n’augmente pas le risque.</p></div><div class="notice">Dans une situation où tu crains une réaction violente, menaçante ou très contrôlante, une confrontation directe peut être inadaptée. Si tu es en danger immédiat, privilégie un lieu sûr et les services d’urgence locaux.</div><div class="field"><textarea id="limSafeNeed" placeholder="Ex. en parler à quelqu’un, ne pas rester seul(e), avoir un endroit où aller…">'+esc(data.safeNeed||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">7 · Ce qui te retient</div><h2>Qu’est-ce que tu crains qu’il se passe si tu dis non ou si tu poses cette limite&nbsp;?</h2></div><div class="field"><textarea id="limConsequence" placeholder="Ex. qu’on me trouve égoïste, qu’on se fâche, qu’on m’en demande moins…">'+esc(data.consequence||"")+'</textarea></div>'+nav(false);
 }
 if(step==="control"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">8 · Tes appuis</div><h2>Qui ou quoi peut t’aider sans t’exposer davantage&nbsp;?</h2></div><div class="card soft-green"><div class="field"><label>Une personne de confiance</label><textarea id="limTrusted" placeholder="Une personne à qui parler ou demander de l’aide…">'+esc(data.trusted||"")+'</textarea></div></div><div class="card cream"><div class="field"><label>Un endroit / un moment plus sûr</label><textarea id="limSafePlace" placeholder="Un lieu, une heure, une façon de communiquer plus sûre…">'+esc(data.safePlace||"")+'</textarea></div></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">8 · Ce qui dépend de qui</div><h2>Sépare ce qui dépend de toi de ce qui dépend de l’autre.</h2></div><div class="card soft-green"><div class="field"><label>Ça dépend de moi</label><textarea id="limMine" placeholder="Dire non, répondre plus tard, partir, répéter ma limite…">'+esc(data.mine||"")+'</textarea></div></div><div class="card coral"><div class="field"><label>Ça dépend de l’autre</label><textarea id="limTheirs" placeholder="Comprendre, être d’accord, ne pas être déçu(e), changer…">'+esc(data.theirs||"")+'</textarea></div></div>'+nav(false);
 }
 if(step==="phrase"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">9 · Un pas discret</div><h2>Quel petit geste peut augmenter ton soutien ou ta marge de manœuvre sans confrontation directe&nbsp;?</h2></div><div class="field"><label>Mon pas sûr</label><textarea id="limSafeStep" placeholder="Ex. parler à une personne de confiance quand je suis seul(e), préparer mes documents importants, demander un rendez-vous professionnel…">'+esc(data.safeStep||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">9 · Construire ta phrase</div><h2>Formule une limite courte et concrète.</h2><p class="muted">Décris le contexte, ta limite, puis éventuellement ce que tu peux proposer.</p></div><div class="field"><label>Quand…</label><input id="limWhen" type="text" placeholder="Ex. Quand tu m’écris après 19 h" value="'+esc(data.whenPart||"")+'"></div><div class="field"><label>Je ne peux / je ne veux plus…</label><input id="limLimit" type="text" placeholder="Ex. répondre aux demandes de travail le soir" value="'+esc(data.limitPart||"")+'"></div><div class="field"><label>Ce que je peux proposer… <span class="muted">(facultatif)</span></label><input id="limOffer" type="text" placeholder="Ex. Je regarderai ton message le lendemain matin" value="'+esc(data.offerPart||"")+'"></div><div class="card cream"><b>Ta phrase</b><p id="limPreview">'+esc(phrasePreview())+'</p></div>'+nav(false);
 }
 if(step==="tone"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">10 · Priorité</div><h2>Quelle priorité te semble la plus sûre maintenant&nbsp;?</h2></div><div class="choices">'+["Créer de la distance","Parler à une personne de confiance","Chercher un conseil professionnel","Identifier un endroit sûr","Gagner du temps sans confrontation"].map(function(x){return '<button class="choice '+(data.safePriority===x?'selected':'')+'" data-lim-safe-priority="'+esc(x)+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">10 · Le ton</div><h2>Quel ton correspond à la situation&nbsp;?</h2></div><div class="choices">'+tones.map(function(x){return '<button class="choice '+(data.tone===x?'selected':'')+'" data-lim-tone="'+x+'">'+x+'</button>'}).join("")+'</div>'+(data.tone?'<div class="card cream"><b>Version '+esc(data.tone.toLowerCase())+'</b><p>'+esc(tonedPhrase())+'</p></div>':'')+nav(false);
 }
 if(step==="repeat"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">11 · Ne pas porter ça seul(e)</div><h2>Quel soutien concret veux-tu demander&nbsp;?</h2><p class="muted">Une écoute, un lieu, un accompagnement, une information, une présence…</p></div><div class="field"><textarea id="limSupportAsk" placeholder="Ex. Est-ce que je peux t’appeler demain pour t’expliquer la situation ?">'+esc(data.supportAsk||"")+'</textarea></div>'+nav(false);
  else host.innerHTML='<div class="hero"><div class="eyebrow">11 · Sans sur-justifier</div><h2>Si l’autre insiste, quelle phrase courte peux-tu répéter&nbsp;?</h2><p class="muted">Tu n’as pas besoin d’ajouter dix nouvelles explications à chaque fois.</p></div><div class="field"><input id="limRepeat" type="text" placeholder="Ex. Je comprends, mais je ne suis pas disponible ce soir." value="'+esc(data.repeat||"")+'"></div><div class="insight">Une limite peut être claire même si l’autre n’est pas d’accord.</div>'+nav(false);
 }
 if(step==="feasibility"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">12 · Vérifier le risque</div><h2>Ce prochain pas peut-il être fait sans augmenter le risque pour toi&nbsp;?</h2></div><div class="choices">'+["Oui","Non","Je ne sais pas"].map(function(x){return '<button class="choice '+(data.safeFeasible===x?'selected':'')+'" data-lim-safe-feasible="'+x+'">'+x+'</button>'}).join("")+'</div>'+((data.safeFeasible==="Non"||data.safeFeasible==="Je ne sais pas")?'<div class="insight">Réduis encore le pas. Par exemple : attendre un moment plus sûr, contacter une personne de confiance ou demander un avis professionnel sans prévenir la personne concernée.</div><div class="field"><label>Version plus sûre</label><textarea id="limSaferStep" placeholder="Un pas qui ne t’expose pas davantage…">'+esc(data.saferStep||"")+'</textarea></div>':'')+nav(false);
  else {var f=Number(data.feasibility||0);host.innerHTML='<div class="hero"><div class="eyebrow">12 · Faisabilité</div><h2>À quel point te sens-tu capable d’essayer cette limite&nbsp;?</h2><p class="muted">1 = trop difficile maintenant · 5 = je peux réellement l’essayer.</p></div><div class="chips">'+[1,2,3,4,5].map(function(n){return '<button class="chip '+(f===n?'selected':'')+'" data-lim-feasibility="'+n+'">'+n+'</button>'}).join("")+'</div>'+(f>0&&f<4?'<div class="insight">Commence plus petit : répondre plus tard, utiliser un message écrit, demander un délai avant de dire oui, ou poser la limite dans une situation moins chargée.</div><div class="field"><label>Version plus facile</label><textarea id="limSmaller" placeholder="Ex. Je vais commencer par dire “je regarde et je te réponds demain” au lieu de répondre oui immédiatement.">'+esc(data.smaller||"")+'</textarea></div>':'')+nav(false)}
 }
 if(step==="action"){
  var proposed=isSafety()?((data.safeFeasible==="Non"||data.safeFeasible==="Je ne sais pas")&&data.saferStep?data.saferStep:data.safeStep):((data.feasibility&&data.feasibility<4&&data.smaller)?data.smaller:tonedPhrase());
  host.innerHTML='<div class="hero"><div class="eyebrow">13 · Prochain pas</div><h2>'+(isSafety()?'Quel est ton prochain pas le plus sûr&nbsp;?':'Quand vas-tu essayer cette limite&nbsp;?')+'</h2></div><div class="card soft-green"><label>Mon prochain pas</label><input id="limAction" type="text" value="'+esc(data.action||proposed||"")+'" placeholder="Mon prochain pas"></div><div class="field"><label>Quand ? <span class="muted">(facultatif)</span></label><input id="limDate" type="date" value="'+esc(data.actionDate||"")+'"></div>'+nav(false);
 }
 if(step==="summary"){
  if(isSafety())host.innerHTML='<div class="hero"><div class="eyebrow">Ta Frontière personnelle</div><h2>Ici, la priorité n’est pas de mieux formuler une limite. C’est de préserver ta sécurité.</h2></div><div class="summary-grid">'+item("Situation",data.context)+item("Ce que cela te coûte",data.cost)+item("Ce que tu veux protéger",data.protect)+item("Ce qui augmenterait ta sécurité",data.safeNeed)+item("Personne de confiance",data.trusted)+item("Priorité",data.safePriority)+item("Soutien à demander",data.supportAsk)+'</div><div class="card soft-green"><div class="eyebrow">Prochain pas sûr</div><h3>'+esc(data.action||"À définir")+'</h3><p>'+(data.actionDate?fmtDate(data.actionDate):"Sans date définie")+'</p></div><div class="notice">Clarity est un outil de réflexion. Si tu te sens en danger immédiat, privilégie un lieu sûr et les services d’urgence locaux.</div><button class="cta" id="limFinish">Enregistrer dans Mon parcours</button><div style="height:10px"></div><button class="secondary" id="limEdit">Modifier une réponse</button>';
  else host.innerHTML='<div class="hero"><div class="eyebrow">Ta Frontière personnelle</div><h2>Ta limite n’a pas besoin d’être acceptée par l’autre pour être claire.</h2></div><div class="summary-grid">'+item("Situation",data.context)+item("Ce que cela te coûte",data.cost)+item("Ce qui ne te convient plus",data.no)+item("Ce que tu protèges",data.protect)+item("Ce que tu crains",data.consequence)+item("Ça dépend de toi",data.mine)+item("Ça dépend de l’autre",data.theirs)+item("Phrase courte si l’autre insiste",data.repeat)+'</div><div class="card cream"><div class="eyebrow">Ta phrase Clarity</div><h3>'+esc(tonedPhrase())+'</h3></div><div class="card soft-green"><div class="eyebrow">Prochain pas</div><h3>'+esc(data.action||"À définir")+'</h3><p>'+(data.actionDate?fmtDate(data.actionDate):"Sans date définie")+'</p></div><button class="cta" id="limFinish">Enregistrer dans Mon parcours</button><div style="height:10px"></div><button class="secondary" id="limEdit">Modifier une réponse</button>';
 }
 bind(step);updateNext(step);sticky();save();requestAnimationFrame(function(){window.scrollTo(0,0)});
}
function capture(step){function v(id){var e=document.getElementById(id);return e?e.value.trim():""}
 if(step==="context")data.context=v("limContext");
 if(step==="current")data.current=v("limCurrent");
 if(step==="cost")data.cost=v("limCost");
 if(step==="zones"){data.okay=v("limOkay");data.depends=v("limDepends");data.no=v("limNo")}
 if(step==="protect")data.protect=v("limProtect");
 if(step==="consequence"){if(isSafety())data.safeNeed=v("limSafeNeed");else data.consequence=v("limConsequence")}
 if(step==="control"){if(isSafety()){data.trusted=v("limTrusted");data.safePlace=v("limSafePlace")}else{data.mine=v("limMine");data.theirs=v("limTheirs")}}
 if(step==="phrase"){if(isSafety())data.safeStep=v("limSafeStep");else{data.whenPart=v("limWhen");data.limitPart=v("limLimit");data.offerPart=v("limOffer")}}
 if(step==="repeat"){if(isSafety())data.supportAsk=v("limSupportAsk");else data.repeat=v("limRepeat")}
 if(step==="feasibility"){if(isSafety())data.saferStep=v("limSaferStep");else data.smaller=v("limSmaller")}
 if(step==="action"){data.action=v("limAction");data.actionDate=v("limDate")}
}
function valid(step){
 if(step==="context")return !!data.context&&!!data.relation;
 if(step==="current")return !!data.current;
 if(step==="cost")return !!data.cost;
 if(step==="zones")return !!data.no;
 if(step==="protect")return !!data.protect;
 if(step==="safety")return !!data.safety;
 if(step==="consequence")return isSafety()?!!data.safeNeed:!!data.consequence;
 if(step==="control")return isSafety()?(!!data.trusted||!!data.safePlace):!!data.mine;
 if(step==="phrase")return isSafety()?!!data.safeStep:(!!data.whenPart&&!!data.limitPart);
 if(step==="tone")return isSafety()?!!data.safePriority:!!data.tone;
 if(step==="repeat")return isSafety()?!!data.supportAsk:!!data.repeat;
 if(step==="feasibility")return isSafety()?!!data.safeFeasible&&((data.safeFeasible==="Oui")||!!data.saferStep):!!data.feasibility&&((data.feasibility>=4)||!!data.smaller);
 if(step==="action")return !!data.action;
 return true;
}
function updateNext(step){var n=document.getElementById("limNext");if(!n)return;capture(step);n.disabled=!valid(step)}
function only(sel,b){document.querySelectorAll(sel).forEach(function(x){x.classList.remove("selected")});b.classList.add("selected")}
function bind(step){
 var back=document.getElementById("limBack"),next=document.getElementById("limNext");
 if(back)back.onclick=function(){capture(step);if(stepIndex>0){stepIndex--;render()}};
 if(next)next.onclick=function(){capture(step);if(valid(step)){stepIndex++;render()}};
 document.querySelectorAll("[data-lim-relation]").forEach(function(b){b.onclick=function(){data.relation=relations[Number(b.dataset.limRelation)];only("[data-lim-relation]",b);save();updateNext(step)}});
 document.querySelectorAll("[data-lim-safety]").forEach(function(b){b.onclick=function(){data.safety=b.dataset.limSafety;save();render()}});
 document.querySelectorAll("[data-lim-tone]").forEach(function(b){b.onclick=function(){data.tone=b.dataset.limTone;save();render()}});
 document.querySelectorAll("[data-lim-safe-priority]").forEach(function(b){b.onclick=function(){data.safePriority=b.dataset.limSafePriority;save();render()}});
 document.querySelectorAll("[data-lim-safe-feasible]").forEach(function(b){b.onclick=function(){data.safeFeasible=b.dataset.limSafeFeasible;save();render()}});
 document.querySelectorAll("[data-lim-feasibility]").forEach(function(b){b.onclick=function(){data.feasibility=Number(b.dataset.limFeasibility);save();render()}});
 document.querySelectorAll("#flow input,#flow textarea").forEach(function(x){x.addEventListener("input",function(){capture(step);var p=document.getElementById("limPreview");if(p)p.textContent=phrasePreview();save();updateNext(step)});x.addEventListener("change",function(){capture(step);save();updateNext(step)})});
 var finish=document.getElementById("limFinish");if(finish)finish.onclick=finishSession;
 var edit=document.getElementById("limEdit");if(edit)edit.onclick=function(){stepIndex=1;render()};
}
function finishSession(){var h=history();h.unshift({id:Date.now(),type:"limits",createdAt:new Date().toISOString(),decision:data.context||"Poser une limite",priorities:[isSafety()?"Sécurité d’abord":"Limite personnelle"],action:data.action||"",actionDate:data.actionDate||"",learned:"",done:false,relation:data.relation||"",protect:data.protect||"",boundary:data.no||"",phrase:isSafety()?"":tonedPhrase(),safety:isSafety()});localStorage.setItem(HISTORY,JSON.stringify(h));clear();active=false;document.querySelector('[data-tab="journey"]').click()}
document.querySelectorAll("[data-limits-start]").forEach(function(b){b.addEventListener("click",function(){start(true)})});
var resume=document.getElementById("resumeBtn");if(resume)resume.addEventListener("click",function(e){if(noOther()&&localStorage.getItem(LIMITS_STORAGE)){e.preventDefault();e.stopImmediatePropagation();start(false)}},{capture:true});
var reset=document.getElementById("resetBtn");if(reset)reset.addEventListener("click",function(e){if(active){e.preventDefault();e.stopImmediatePropagation();if(window.confirm("Recommencer ce parcours ? Tes réponses en cours seront effacées.")){clear();start(true)}}},{capture:true});
document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){active=false})});window.addEventListener("resize",sticky);if(read()&&noOther())showResume();
})();