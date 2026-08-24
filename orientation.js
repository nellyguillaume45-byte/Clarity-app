(function(){
"use strict";
var step=0,first="",second="";
var routes={
  decision:{title:"🧭 La Boussole du choix",selector:'[data-start="decision"]',why:"Tu sembles surtout avoir besoin de comparer des options, distinguer les faits des anticipations et trouver le prochain élément utile pour avancer."},
  confidence:{title:"🌱 Le Miroir des preuves",selector:"[data-confidence-start]",why:"Ton blocage semble surtout lié au doute sur toi. Ce parcours part d’une situation précise et confronte le doute à des éléments observables."},
  procrastination:{title:"⏳ Le Frein caché",selector:"[data-pro-start]",why:"Tu sais plutôt ce que tu veux faire, mais le démarrage coince. Ce parcours cherche la friction concrète avant de réduire le premier pas."},
  lost:{title:"🌫️ La Carte des priorités",selector:"[data-lost-start]",why:"Tu ne cherches pas encore une décision précise : tu as surtout besoin de retrouver des repères et une direction à explorer."},
  rumination:{title:"🔁 Le Cercle de contrôle",selector:"[data-rumination-start]",why:"La même question semble revenir sans information nouvelle. Ce parcours sépare faits, interprétations et zones de contrôle."},
  limits:{title:"🛡️ La Frontière personnelle",selector:"[data-limits-start]",why:"Le point central semble être ce que tu acceptes, ce que tu veux protéger et la manière de poser une limite concrète."},
  failure:{title:"⚡ Le Test du scénario",selector:"[data-failure-start]",why:"Tu sais davantage ce que tu aimerais tenter, mais la peur du résultat te retient. Ce parcours aide à calibrer le risque et créer un essai plus petit."},
  motivation:{title:"🔋 La Jauge d’énergie",selector:"[data-motivation-start]",why:"Le problème ressemble moins à un simple premier pas qu’à une baisse d’énergie, d’envie, de sens ou de clarté autour d’un objectif."},
  relationship:{title:"🤝 La Carte de la relation",selector:"[data-relationship-start]",why:"Tu sembles surtout avoir besoin de comprendre ce qui se passe dans une relation, ce dont tu as besoin et quelle direction te convient."},
  change:{title:"🌅 Le Pont vers la suite",selector:"[data-change-start]",why:"Tu sens qu’une partie de ta vie doit évoluer. Ce parcours aide à préciser ce qu’il faut laisser, préserver et tester sans tout bouleverser."}
};
var firstChoices=[
  {id:"choice",label:"Une décision ou un choix me bloque"},
  {id:"action",label:"Je n’arrive pas à passer à l’action"},
  {id:"thoughts",label:"Mes pensées tournent en boucle"},
  {id:"relation",label:"Une relation ou une personne me pèse"},
  {id:"direction",label:"Je ne sais plus où je vais / j’ai besoin de changement"},
  {id:"self",label:"Je doute beaucoup de moi"}
];
var branches={
  choice:[{id:"decision",label:"J’hésite entre plusieurs options"},{id:"failure",label:"Je sais ce que j’aimerais tenter, mais j’ai peur d’échouer"}],
  action:[{id:"procrastination",label:"Je sais quoi faire, mais je repousse"},{id:"motivation",label:"Je n’ai plus vraiment d’énergie, d’envie ou de sens"}],
  thoughts:[{id:"rumination",label:"Je repense à la même situation sans obtenir d’information nouvelle"},{id:"decision",label:"Je tourne surtout autour de la peur de faire le mauvais choix"}],
  relation:[{id:"limits",label:"J’ai surtout du mal à dire non ou à protéger mon espace"},{id:"relationship",label:"J’essaie surtout de comprendre quoi faire de cette relation"}],
  direction:[{id:"lost",label:"Je suis perdu(e) et je ne sais pas encore quelle direction prendre"},{id:"change",label:"Je sais que quelque chose doit changer, même si je ne sais pas encore comment"}],
  self:[{id:"confidence",label:"Je doute surtout de mes capacités ou de ma légitimité"},{id:"failure",label:"Je me sens surtout bloqué(e) par la peur de rater si j’essaie"}]
};
function esc(s){return String(s||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
function host(){return document.getElementById("flowContent")}
function showFlow(){document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});document.getElementById("flow").classList.add("active");document.querySelector(".bottom").classList.add("hidden");document.getElementById("resetBtn").classList.add("hidden");document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active")});}
function progress(v){document.getElementById("progress").style.width=v+"%";}
function render(){
  showFlow();
  var flow=document.getElementById("flow");
  flow.classList.toggle("sticky-question",step<2);
  if(step===0){
    progress(33);
    host().innerHTML='<div class="hero"><div class="eyebrow">Trouver par où commencer</div><h2>Qu’est-ce qui te prend le plus d’énergie aujourd’hui&nbsp;?</h2><p class="muted">Choisis ce qui ressemble le plus à ton blocage. Ce n’est pas un diagnostic.</p></div><div class="choices">'+firstChoices.map(function(x){return '<button class="choice '+(first===x.id?'selected':'')+'" data-or-first="'+x.id+'">'+esc(x.label)+'</button>'}).join("")+'</div><div class="navrow"><button class="secondary" data-or-home>Retour</button><button class="cta" data-or-next '+(!first?'disabled':'')+'>Continuer</button></div>';
  }else if(step===1){
    progress(66);
    var opts=branches[first]||[];
    host().innerHTML='<div class="hero"><div class="eyebrow">Préciser le blocage</div><h2>Laquelle de ces deux phrases te ressemble le plus&nbsp;?</h2><p class="muted">Choisis la plus proche, même si elle n’est pas parfaite.</p></div><div class="choices">'+opts.map(function(x){return '<button class="choice '+(second===x.id?'selected':'')+'" data-or-second="'+x.id+'">'+esc(x.label)+'</button>'}).join("")+'</div><div class="navrow"><button class="secondary" data-or-back>Retour</button><button class="cta" data-or-next '+(!second?'disabled':'')+'>Voir ma suggestion</button></div>';
  }else{
    progress(100);flow.classList.remove("sticky-question");
    var r=routes[second]||routes.lost;
    host().innerHTML='<div class="hero"><div class="eyebrow">Un point de départ possible</div><h2>'+r.title+'</h2><p>À partir de tes réponses, c’est le parcours qui semble le plus utile pour commencer.</p></div><div class="card cream"><h3>Pourquoi celui-ci ?</h3><p>'+esc(r.why)+'</p></div><div class="notice">Cette suggestion sert seulement à t’orienter. Elle ne pose aucun diagnostic et tu peux choisir un autre parcours à tout moment.</div><button class="cta" data-or-start>Commencer ce parcours</button><div style="height:10px"></div><button class="secondary" data-or-explore>Voir les 10 parcours</button>';
  }
  bind();requestAnimationFrame(function(){window.scrollTo(0,0)});
}
function bind(){
  document.querySelectorAll("[data-or-first]").forEach(function(b){b.addEventListener("click",function(){first=b.dataset.orFirst;second="";render()})});
  document.querySelectorAll("[data-or-second]").forEach(function(b){b.addEventListener("click",function(){second=b.dataset.orSecond;render()})});
  var next=document.querySelector("[data-or-next]");if(next)next.addEventListener("click",function(){if(step===0&&first){step=1;render()}else if(step===1&&second){step=2;render()}});
  var back=document.querySelector("[data-or-back]");if(back)back.addEventListener("click",function(){step=0;second="";render()});
  var home=document.querySelector("[data-or-home]");if(home)home.addEventListener("click",function(){document.querySelector('[data-tab="today"]').click()});
  var explore=document.querySelector("[data-or-explore]");if(explore)explore.addEventListener("click",function(){document.querySelector('[data-tab="explore"]').click()});
  var start=document.querySelector("[data-or-start]");if(start)start.addEventListener("click",function(){var r=routes[second];var b=r&&document.querySelector(r.selector);if(b)b.click()});
}
document.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("[data-orientation-start]"):null;if(!b)return;e.preventDefault();step=0;first="";second="";render();},true);
})();