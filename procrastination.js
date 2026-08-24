(function(){
  "use strict";

  var PRO_STORAGE="clarity_v0_procrastination_state";
  var DECISION_STORAGE="clarity_v0_state";
  var HISTORY="clarity_v0_history";
  var active=false;
  var stepIndex=0;
  var data={};
  var steps=["intro","task","reaction","cause","branch","tradeoff","micro","ease","friction","action","summary"];

  var reactions=[
    "Je ne sais pas par où commencer",
    "Ça me paraît énorme",
    "Je ressens du stress ou de la peur",
    "J’attends le bon moment",
    "Je suis fatigué(e) rien que d’y penser",
    "Je n’en vois pas vraiment l’intérêt",
    "Autre chose"
  ];

  var causes=[
    {id:"clarity",label:"Manque de clarté",hint:"Je ne sais pas exactement quoi faire."},
    {id:"size",label:"Tâche trop grande",hint:"Le premier pas est noyé dans l’ensemble."},
    {id:"fear",label:"Peur",hint:"Une conséquence ou un jugement me freine."},
    {id:"perfection",label:"Perfectionnisme",hint:"J’ai l’impression qu’il faut très bien faire."},
    {id:"energy",label:"Manque d’énergie",hint:"Je veux avancer mais je n’ai pas assez de ressources."},
    {id:"meaning",label:"Manque de sens",hint:"Je ne suis pas sûr(e) que cette tâche mérite mon énergie."}
  ];

  function esc(str){return String(str||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
  function nav(backDisabled){return '<div class="navrow"><button class="secondary" id="proBack" '+(backDisabled?'disabled':'')+'>Retour</button><button class="cta" id="proNext">Continuer</button></div>';}
  function item(t,v){return '<div class="summary-item"><b>'+esc(t)+'</b><span>'+esc(v||"—")+'</span></div>';}

  function causeLabel(id){var c=causes.find(function(x){return x.id===id});return c?c.label:"—";}
  function branchCopy(id){
    var map={
      clarity:{eye:"Rendre la tâche visible",q:"Qu’est-ce qui n’est pas assez clair pour commencer ?",help:"Cherche le point précis où tu ne sais plus quoi faire.",ph:"Ex. je ne sais pas quelles expériences garder dans le CV…"},
      size:{eye:"Découper",q:"Quelle partie de la tâche semble trop grande ou trop floue ?",help:"On cherche un morceau qui peut exister séparément du reste.",ph:"Ex. je pense à tout le CV d’un coup…"},
      fear:{eye:"Nommer la peur",q:"Qu’est-ce que tu crains qu’il se passe si tu t’y mets vraiment ?",help:"Une peur précise est plus facile à traiter qu’un malaise général.",ph:"Ex. découvrir que mon CV n’est pas assez bon…"},
      perfection:{eye:"Sortir du parfait",q:"À quoi ressemblerait une version simplement “suffisamment bonne” ?",help:"Pas la version finale idéale : une première version acceptable.",ph:"Ex. un CV propre avec les informations essentielles…"},
      energy:{eye:"Respecter l’énergie",q:"Qu’est-ce qui consomme ton énergie avant même de commencer ?",help:"Parfois, avancer demande d’abord de réduire la charge autour de la tâche.",ph:"Ex. je tente de le faire le soir quand je suis déjà épuisé(e)…"},
      meaning:{eye:"Vérifier le sens",q:"Pourquoi cette tâche est-elle encore sur ta liste ?",help:"Distingue ce que tu veux vraiment de ce que tu penses devoir faire.",ph:"Ex. parce que je veux changer de poste / parce qu’on attend ça de moi…"}
    };
    return map[id]||map.clarity;
  }

  function readState(){
    try{
      var raw=localStorage.getItem(PRO_STORAGE);
      if(!raw)return false;
      var saved=JSON.parse(raw);
      data=saved.data||{};
      stepIndex=Number.isInteger(saved.step)?saved.step:0;
      if(stepIndex<0||stepIndex>=steps.length)stepIndex=0;
      return true;
    }catch(e){return false;}
  }

  function save(){
    localStorage.setItem(PRO_STORAGE,JSON.stringify({data:data,step:stepIndex}));
    showResume();
  }

  function clear(){localStorage.removeItem(PRO_STORAGE);data={};stepIndex=0;}

  function showResume(){
    if(localStorage.getItem(DECISION_STORAGE))return;
    var card=document.getElementById("resumeCard"),text=document.getElementById("resumeText");
    if(!card||!text)return;
    card.classList.remove("hidden");
    text.textContent=data.task?"Tu travaillais sur : « "+data.task+" »":"Tu as un parcours Le Frein caché en cours.";
  }

  function syncStickyOffset(){var t=document.querySelector(".topbar");if(t)document.documentElement.style.setProperty("--topbar-h",t.offsetHeight+"px");}

  function showFlow(){
    document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});
    document.getElementById("flow").classList.add("active");
    document.querySelector(".bottom").classList.add("hidden");
    document.getElementById("resetBtn").classList.remove("hidden");
    document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active")});
    active=true;
    render();
  }

  function start(fresh){
    if(fresh){localStorage.removeItem(DECISION_STORAGE);clear();}
    else readState();
    active=true;
    showFlow();
  }

  function render(){
    var step=steps[stepIndex],host=document.getElementById("flowContent"),flow=document.getElementById("flow");
    flow.classList.toggle("sticky-question",step!=="intro"&&step!=="summary");
    document.getElementById("progress").style.width=Math.round((stepIndex/(steps.length-1))*100)+"%";

    if(step==="intro") host.innerHTML='<div class="hero"><div class="eyebrow">Le Frein caché</div><h2>On ne va pas essayer de te “motiver”.</h2><p>On va identifier ce qui rend le démarrage difficile, puis réduire la friction du premier pas.</p></div><div class="card soft-green"><b>Objectif</b><p>Passer d’une tâche repoussée à une action suffisamment petite pour être commencée sans attendre le moment parfait.</p></div>'+nav(true);

    if(step==="task") host.innerHTML='<div class="hero"><div class="eyebrow">1 · La tâche</div><h2>Qu’est-ce que tu repousses en ce moment&nbsp;?</h2><p class="muted">Choisis une seule tâche concrète pour ce parcours.</p></div><div class="field"><label>Ce que je repousse</label><textarea id="proTask" placeholder="Ex. Mettre à jour mon CV">'+esc(data.task||"")+'</textarea></div><div class="field"><label>Depuis quand ? <span class="muted">(facultatif)</span></label><input id="proSince" type="text" placeholder="Ex. depuis deux semaines" value="'+esc(data.since||"")+'"></div>'+nav(false);

    if(step==="reaction") host.innerHTML='<div class="hero"><div class="eyebrow">2 · Ce qui se passe</div><h2>Quand tu penses à cette tâche, quelle réaction ressemble le plus à la tienne&nbsp;?</h2></div><div class="choices">'+reactions.map(function(x,i){return '<button class="choice '+(data.reaction===x?'selected':'')+'" data-pro-reaction="'+i+'">'+esc(x)+'</button>'}).join("")+'</div>'+nav(false);

    if(step==="cause") host.innerHTML='<div class="hero"><div class="eyebrow">3 · Le Frein caché</div><h2>Quel frein semble le plus important ici&nbsp;?</h2><p class="muted">Choisis celui qui explique le mieux pourquoi tu repousses aujourd’hui.</p></div><div class="choices">'+causes.map(function(x){return '<button class="choice '+(data.cause===x.id?'selected':'')+'" data-pro-cause="'+x.id+'"><b>'+esc(x.label)+'</b><span class="muted" style="display:block;font-size:13px;margin-top:4px;font-weight:500">'+esc(x.hint)+'</span></button>'}).join("")+'</div>'+nav(false);

    if(step==="branch"){
      var b=branchCopy(data.cause);
      host.innerHTML='<div class="hero"><div class="eyebrow">4 · '+esc(b.eye)+'</div><h2>'+esc(b.q)+'</h2><p class="muted">'+esc(b.help)+'</p></div><div class="field"><textarea id="proBranch" placeholder="'+esc(b.ph)+'">'+esc(data.branchAnswer||"")+'</textarea></div>'+nav(false);
    }

    if(step==="tradeoff") host.innerHTML='<div class="hero"><div class="eyebrow">5 · Ce que le report protège</div><h2>Qu’est-ce que repousser t’apporte à court terme — et qu’est-ce que ça te coûte ensuite&nbsp;?</h2></div><div class="card cream"><div class="field"><label>À court terme, repousser m’évite ou m’apporte…</label><textarea id="proBenefit" placeholder="Ex. j’évite le stress, je garde mon énergie…">'+esc(data.shortBenefit||"")+'</textarea></div></div><div class="card coral"><div class="field"><label>Plus tard, ça me coûte…</label><textarea id="proCost" placeholder="Ex. culpabilité, urgence, opportunité manquée…">'+esc(data.laterCost||"")+'</textarea></div></div>'+nav(false);

    if(step==="micro") host.innerHTML='<div class="hero"><div class="eyebrow">6 · Réduire le premier pas</div><h2>Quelle version de cette tâche peut tenir en moins de 10 minutes&nbsp;?</h2><p class="muted">Pas “avancer sur le CV” : plutôt “ouvrir l’ancien CV et relire le titre”.</p></div><div class="field"><label>Mon micro-pas</label><input id="proMicro" type="text" placeholder="Ex. Ouvrir mon ancien CV" value="'+esc(data.microAction||"")+'"></div>'+nav(false);

    if(step==="ease"){
      var ease=Number(data.ease||0);
      host.innerHTML='<div class="hero"><div class="eyebrow">7 · Faisabilité</div><h2>À quel point ce micro-pas te paraît facile à commencer&nbsp;?</h2><p class="muted">1 = encore très difficile · 5 = je peux le faire presque sans négocier avec moi-même.</p></div><div class="chips">'+[1,2,3,4,5].map(function(n){return '<button class="chip '+(ease===n?'selected':'')+'" data-pro-ease="'+n+'">'+n+'</button>'}).join("")+'</div>'+(ease>0&&ease<4?'<div class="insight">S’il reste difficile à commencer, réduis encore le pas. Clarity cherche un démarrage crédible, pas une preuve de volonté.</div><div class="field"><label>Version encore plus petite</label><input id="proSmaller" type="text" placeholder="Ex. Poser le CV sur mon bureau" value="'+esc(data.smallerAction||"")+'"></div>':'')+nav(false);
    }

    if(step==="friction") host.innerHTML='<div class="hero"><div class="eyebrow">8 · Enlever une friction</div><h2>Qu’est-ce qui peut rendre le démarrage plus simple&nbsp;?</h2><p class="muted">Préparer le matériel, fermer une distraction, demander une information, choisir un lieu…</p></div><div class="field"><textarea id="proFriction" placeholder="Ex. Mettre le document sur l’écran d’accueil et couper les notifications pendant 10 minutes">'+esc(data.frictionRemoval||"")+'</textarea></div>'+nav(false);

    if(step==="action"){
      var proposed=(data.ease&&data.ease<4&&data.smallerAction)?data.smallerAction:data.microAction;
      host.innerHTML='<div class="hero"><div class="eyebrow">9 · Prochain pas</div><h2>Quand vas-tu tester ce premier pas&nbsp;?</h2><p class="muted">Le but n’est pas de finir la tâche. Seulement de commencer le mouvement.</p></div><div class="card soft-green"><label>Action</label><input id="proAction" type="text" value="'+esc(data.action||proposed||"")+'" placeholder="Mon premier pas"></div><div class="field"><label>Quand ?</label><input id="proDate" type="date" value="'+esc(data.actionDate||"")+'"></div>'+nav(false);
    }

    if(step==="summary") host.innerHTML='<div class="hero"><div class="eyebrow">Ton Frein caché</div><h2>Tu n’as pas besoin de plus de pression. Tu as besoin d’un démarrage plus clair.</h2></div><div class="summary-grid">'+item("Tâche repoussée",data.task)+item("Frein principal",causeLabel(data.cause))+item("Ce que le report protège",data.shortBenefit)+item("Ce qu’il coûte",data.laterCost)+item("Micro-pas",data.microAction)+item("Friction à enlever",data.frictionRemoval)+'</div><div class="card soft-green"><div class="eyebrow">Prochain pas</div><h3>'+esc(data.action||"À définir")+'</h3><p>'+(data.actionDate?formatDate(data.actionDate):"Sans date définie")+'</p></div><div class="insight">Le frein principal que tu as identifié est <b>'+esc(causeLabel(data.cause))+'</b>. Ici, réussir signifie commencer le test prévu — pas terminer toute la tâche.</div><button class="cta" id="proFinish">Enregistrer dans Mon parcours</button><div style="height:10px"></div><button class="secondary" id="proEdit">Modifier une réponse</button>';

    bind(step);
    updateNext(step);
    syncStickyOffset();
    save();
    requestAnimationFrame(function(){window.scrollTo(0,0)});
  }

  function capture(step){
    function v(id){var e=document.getElementById(id);return e?e.value.trim():"";}
    if(step==="task"){data.task=v("proTask");data.since=v("proSince");}
    if(step==="branch")data.branchAnswer=v("proBranch");
    if(step==="tradeoff"){data.shortBenefit=v("proBenefit");data.laterCost=v("proCost");}
    if(step==="micro")data.microAction=v("proMicro");
    if(step==="ease")data.smallerAction=v("proSmaller");
    if(step==="friction")data.frictionRemoval=v("proFriction");
    if(step==="action"){data.action=v("proAction");data.actionDate=v("proDate");}
  }

  function valid(step){
    if(step==="task")return !!data.task;
    if(step==="reaction")return !!data.reaction;
    if(step==="cause")return !!data.cause;
    if(step==="branch")return !!data.branchAnswer;
    if(step==="micro")return !!data.microAction;
    if(step==="ease")return !!data.ease&&(data.ease>=4||!!data.smallerAction);
    if(step==="action")return !!data.action;
    return true;
  }

  function updateNext(step){var n=document.getElementById("proNext");if(!n)return;capture(step);n.disabled=!valid(step);}
  function selectOnly(sel,button){document.querySelectorAll(sel).forEach(function(x){x.classList.remove("selected")});button.classList.add("selected");}

  function bind(step){
    var back=document.getElementById("proBack"),next=document.getElementById("proNext");
    if(back)back.onclick=function(){capture(step);if(stepIndex>0){stepIndex--;render();}};
    if(next)next.onclick=function(){capture(step);if(valid(step)){stepIndex++;render();}};

    document.querySelectorAll("[data-pro-reaction]").forEach(function(b){b.onclick=function(){data.reaction=reactions[Number(b.dataset.proReaction)];selectOnly("[data-pro-reaction]",b);save();updateNext(step);}});
    document.querySelectorAll("[data-pro-cause]").forEach(function(b){b.onclick=function(){data.cause=b.dataset.proCause;data.branchAnswer="";selectOnly("[data-pro-cause]",b);save();updateNext(step);}});
    document.querySelectorAll("[data-pro-ease]").forEach(function(b){b.onclick=function(){data.ease=Number(b.dataset.proEase);render();}});
    document.querySelectorAll("#flow input,#flow textarea").forEach(function(el){el.addEventListener("input",function(){capture(step);save();updateNext(step)});el.addEventListener("change",function(){capture(step);save();updateNext(step)});});

    var finish=document.getElementById("proFinish");if(finish)finish.onclick=finishSession;
    var edit=document.getElementById("proEdit");if(edit)edit.onclick=function(){stepIndex=1;render();};
  }

  function formatDate(iso){if(!iso)return "";var d=new Date(iso+"T12:00:00");return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});}
  function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY)||"[]")}catch(e){return[]}}

  function finishSession(){
    var h=getHistory();
    h.unshift({
      id:Date.now(),type:"procrastination",createdAt:new Date().toISOString(),
      decision:data.task||"Tâche repoussée",
      priorities:["Frein : "+causeLabel(data.cause)],
      action:data.action||"",actionDate:data.actionDate||"",learned:"",done:false,
      task:data.task||"",cause:data.cause||"",reaction:data.reaction||"",microAction:data.microAction||"",frictionRemoval:data.frictionRemoval||""
    });
    localStorage.setItem(HISTORY,JSON.stringify(h));
    clear();active=false;
    document.querySelector('[data-tab="journey"]').click();
  }

  document.querySelectorAll("[data-pro-start]").forEach(function(b){b.addEventListener("click",function(){start(true)});});

  document.querySelectorAll('[data-start="decision"]').forEach(function(b){b.addEventListener("click",function(){localStorage.removeItem(PRO_STORAGE);},{capture:true});});

  var resume=document.getElementById("resumeBtn");
  if(resume)resume.addEventListener("click",function(e){if(!localStorage.getItem(DECISION_STORAGE)&&localStorage.getItem(PRO_STORAGE)){e.preventDefault();e.stopImmediatePropagation();start(false);}},{capture:true});

  var reset=document.getElementById("resetBtn");
  if(reset)reset.addEventListener("click",function(e){if(active){e.preventDefault();e.stopImmediatePropagation();if(window.confirm("Recommencer ce parcours ? Tes réponses en cours seront effacées.")){clear();start(true);}}},{capture:true});

  var erase=document.getElementById("eraseBtn");
  if(erase)erase.addEventListener("click",function(e){
    e.preventDefault();e.stopImmediatePropagation();
    if(window.confirm("Effacer toutes les données locales de Clarity sur cet appareil ?")){
      localStorage.removeItem(DECISION_STORAGE);localStorage.removeItem(PRO_STORAGE);localStorage.removeItem(HISTORY);window.location.reload();
    }
  },{capture:true});

  document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){active=false;});});
  window.addEventListener("resize",syncStickyOffset);

  if(readState()&&!localStorage.getItem(DECISION_STORAGE))showResume();
})();
