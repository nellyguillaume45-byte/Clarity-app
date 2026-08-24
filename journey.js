(function(){
"use strict";
var HISTORY="clarity_v0_history";
var names={decision:"🧭 La Boussole du choix",confidence:"🌱 Le Miroir des preuves",procrastination:"⏳ Le Frein caché",lost:"🌫️ La Carte des priorités",rumination:"🔁 Le Cercle de contrôle",limits:"🛡️ La Frontière personnelle",failure:"⚡ Le Test du scénario",motivation:"🔋 La Jauge d’énergie",relationship:"🤝 La Carte de la relation",change:"🌅 Le Pont vers la suite"};
function esc(s){return String(s||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
function read(){try{return JSON.parse(localStorage.getItem(HISTORY)||"[]")}catch(e){return[]}}
function write(h){localStorage.setItem(HISTORY,JSON.stringify(h));}
function fmtDate(iso){if(!iso)return "";var d=new Date(iso+"T12:00:00");return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});}
function fmtCreated(iso){if(!iso)return "";try{return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}catch(e){return ""}}
function title(s){return names[s.type]||"Parcours Clarity";}
function subject(s){return s.decision||s.goal||s.situation||s.context||s.loop||s.attempt||s.burden||s.sentence||"Réflexion enregistrée";}
function pending(h){for(var i=0;i<h.length;i++){if(h[i].action&&!h[i].done)return h[i]}return null;}
function renderHomeNext(){
  var old=document.getElementById("nextStepCard");if(old)old.remove();
  var h=read(),p=pending(h),resume=document.getElementById("resumeCard");if(!p||!resume)return;
  var card=document.createElement("div");card.id="nextStepCard";card.className="card soft-green";
  card.innerHTML='<div class="eyebrow">Ton prochain pas</div><h3>'+esc(p.action)+'</h3><p>'+(p.actionDate?fmtDate(p.actionDate):"Quand tu es prêt(e)")+'</p><button class="secondary" data-open-journey>Ouvrir Mon parcours</button>';
  resume.parentNode.insertBefore(card,resume.nextSibling);
  var b=card.querySelector("[data-open-journey]");if(b)b.addEventListener("click",function(){var t=document.querySelector('[data-tab="journey"]');if(t)t.click()});
}
function renderJourney(){
  var host=document.getElementById("journeyList");if(!host)return;
  var h=read();
  if(!h.length){host.innerHTML='<div class="empty"><h3>Ton parcours commence ici.</h3><p class="muted">Après un exercice, ta synthèse, ton prochain pas et ce que tu as appris apparaîtront ici.</p><button class="cta" data-j-explore>Choisir un parcours</button></div>';var e=host.querySelector("[data-j-explore]");if(e)e.addEventListener("click",function(){document.querySelector('[data-tab="explore"]').click()});return;}
  var p=pending(h),html="";
  if(p){html+='<div class="card soft-green journey-focus"><div class="eyebrow">Prochain pas</div><h3>'+esc(p.action)+'</h3><p>'+(p.actionDate?fmtDate(p.actionDate):"Sans date définie")+'</p><p class="muted">'+esc(title(p))+'</p><button class="cta" data-j-done="'+esc(String(p.id))+'">Je l’ai fait ✓</button></div>';}
  html+='<div class="journey-section-title"><h3>Mes réflexions</h3><p class="muted">Les plus récentes en premier.</p></div>';
  h.forEach(function(s){
    html+='<article class="session" data-session="'+esc(String(s.id))+'"><div class="date">'+esc(fmtCreated(s.createdAt))+'</div><h3>'+esc(title(s))+'</h3><p>'+esc(subject(s))+'</p>';
    if(s.action)html+='<div class="journey-action"><b>Prochain pas</b><span>'+esc(s.action)+(s.actionDate?' · '+esc(fmtDate(s.actionDate)):'')+'</span></div>';
    if(s.done)html+='<div class="journey-status done-state">✓ Réalisé</div>';else if(s.action)html+='<div class="journey-status">À faire</div>';
    if(s.learned)html+='<div class="insight"><b>Ce que ça m’a appris</b><br>'+esc(s.learned)+'</div>';
    html+='<div class="session-actions">';
    if(s.action&&!s.done)html+='<button class="mini" data-j-done="'+esc(String(s.id))+'">Je l’ai fait</button>';
    if(s.done)html+='<button class="mini" data-j-learn="'+esc(String(s.id))+'">'+(s.learned?'Modifier mon apprentissage':'Ajouter ce que j’ai appris')+'</button>';
    html+='</div><div class="followup hidden" data-followup="'+esc(String(s.id))+'"><label>Qu’est-ce que ça t’a appris&nbsp;?</label><textarea data-learn-text placeholder="Une phrase suffit…">'+esc(s.learned||"")+'</textarea><div class="session-actions"><button class="mini done" data-j-save="'+esc(String(s.id))+'">Enregistrer</button><button class="mini" data-j-cancel>Annuler</button></div></div></article>';
  });
  host.innerHTML=html;bindJourney(host);
}
function findIndex(h,id){for(var i=0;i<h.length;i++){if(String(h[i].id)===String(id))return i}return -1;}
function openFollowup(id,markDone){var h=read(),i=findIndex(h,id);if(i<0)return;if(markDone){h[i].done=true;write(h)}renderJourney();var box=document.querySelector('[data-followup="'+CSS.escape(String(id))+'"]');if(box){box.classList.remove("hidden");var ta=box.querySelector("textarea");if(ta)ta.focus()}renderHomeNext();}
function bindJourney(host){
  host.querySelectorAll("[data-j-done]").forEach(function(b){b.addEventListener("click",function(){openFollowup(b.dataset.jDone,true)})});
  host.querySelectorAll("[data-j-learn]").forEach(function(b){b.addEventListener("click",function(){openFollowup(b.dataset.jLearn,false)})});
  host.querySelectorAll("[data-j-save]").forEach(function(b){b.addEventListener("click",function(){var id=b.dataset.jSave,h=read(),i=findIndex(h,id),box=b.closest(".followup"),ta=box&&box.querySelector("[data-learn-text]");if(i<0)return;h[i].done=true;h[i].learned=ta?ta.value.trim():"";write(h);renderJourney();renderHomeNext()})});
  host.querySelectorAll("[data-j-cancel]").forEach(function(b){b.addEventListener("click",function(){var box=b.closest(".followup");if(box)box.classList.add("hidden")})});
}
function scheduleRender(){setTimeout(function(){renderJourney();renderHomeNext()},0)}
document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){if(b.dataset.tab==="journey")scheduleRender();if(b.dataset.tab==="today")setTimeout(renderHomeNext,0)})});
document.addEventListener("DOMContentLoaded",function(){scheduleRender()});
window.addEventListener("storage",scheduleRender);
})();