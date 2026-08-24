(function(){
  "use strict";
  var STORAGE="clarity_v0_state";
  var HISTORY="clarity_v0_history";
  var currentStep=0;
  var data={};
  var screens=["intro","decision","difficulty","options","priorities","compassA","compassB","facts","branch","reversible","information","action","summary"];
  var priorities=["Sécurité","Liberté","Argent","Famille","Temps","Équilibre","Sens","Stabilité","Évolution","Plaisir","Reconnaissance","Autonomie","Relations","Apprentissage"];
  var difficulties=[
    "Je ne sais pas vraiment ce que je veux",
    "Je sais ce que je veux, mais j’ai peur de me tromper",
    "J’hésite entre deux bonnes options",
    "J’hésite entre deux options qui ne me conviennent pas vraiment",
    "Il me manque des informations",
    "Ma décision dépend aussi d’autres personnes",
    "Je ne sais pas"
  ];

  function load(){
    try{
      var raw=localStorage.getItem(STORAGE);
      if(raw){
        var saved=JSON.parse(raw);
        data=saved.data||{};
        currentStep=Number.isInteger(saved.step)?saved.step:0;
        document.getElementById("resumeCard").classList.remove("hidden");
        document.getElementById("resumeText").textContent=data.decision ? "Tu réfléchissais à : « "+data.decision+" »" : "Tu as un parcours en cours.";
      }
    }catch(e){}
    renderJourney();
  }
  function save(){localStorage.setItem(STORAGE,JSON.stringify({data:data,step:currentStep}));}
  function clearCurrent(){
    localStorage.removeItem(STORAGE);
    data={}; currentStep=0;
    document.getElementById("resumeCard").classList.add("hidden");
  }
  function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY)||"[]")}catch(e){return[]}}
  function setHistory(h){localStorage.setItem(HISTORY,JSON.stringify(h))}
  function showScreen(id){
    document.querySelectorAll(".screen").forEach(function(s){s.classList.remove("active")});
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("active",t.dataset.tab===id)});
    var inFlow=id==="flow";
    document.querySelector(".bottom").classList.toggle("hidden",inFlow);
    document.getElementById("resetBtn").classList.toggle("hidden",!inFlow);
    window.scrollTo(0,0);
    if(id==="journey") renderJourney();
  }
  function startDecision(fresh){if(fresh){clearCurrent()} showScreen("flow"); renderStep();}
  function escapeHtml(str){return String(str||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});}
  function nav(backDisabled){
    return '<div class="navrow">'+
      '<button class="secondary" id="backStep" '+(backDisabled?'disabled':'')+'>Retour</button>'+ 
      '<button class="cta" id="nextStep">Continuer</button></div>';
  }
  function syncStickyOffset(){
    var topbar=document.querySelector(".topbar");
    if(topbar) document.documentElement.style.setProperty("--topbar-h",topbar.offsetHeight+"px");
  }
  function renderStep(){
    save();
    var step=screens[currentStep];
    var flow=document.getElementById("flow");
    flow.classList.toggle("sticky-question",step!=="intro" && step!=="summary");
    syncStickyOffset();
    var pct=Math.round((currentStep/(screens.length-1))*100);
    document.getElementById("progress").style.width=pct+"%";
    var c=document.getElementById("flowContent");

    if(step==="intro"){
      c.innerHTML='<div class="hero"><div class="eyebrow">La Boussole du choix</div><h2>Tu n’as pas besoin de décider tout de suite.</h2><p>On va d’abord séparer ce qui compte pour toi, ce que tu sais réellement et ce que tu redoutes.</p></div><div class="card soft-green"><b>Objectif</b><p>Sortir de la confusion avec un prochain pas concret — parfois une décision, parfois simplement une expérience pour obtenir une information utile.</p></div>'+nav(true);
    }
    if(step==="decision"){
      c.innerHTML='<div class="hero"><div class="eyebrow">1 · Ta situation</div><h2>Quelle décision occupes-tu en ce moment&nbsp;?</h2><p class="muted">Écris-la comme elle te vient. Tu pourras la reformuler plus tard.</p></div><div class="field"><label for="decisionText">Ma décision</label><textarea id="decisionText" placeholder="Ex. Est-ce que je dois accepter ce nouveau poste ?">'+escapeHtml(data.decision||"")+'</textarea></div>'+nav(false);
    }
    if(step==="difficulty"){
      c.innerHTML='<div class="hero"><div class="eyebrow">2 · Le nœud</div><h2>Qu’est-ce qui rend cette décision difficile&nbsp;?</h2></div><div class="choices">'+difficulties.map(function(x,i){return '<button class="choice '+(data.difficulty===x?'selected':'')+'" data-difficulty="'+i+'">'+escapeHtml(x)+'</button>'}).join("")+'</div>'+nav(false);
    }
    if(step==="options"){
      c.innerHTML='<div class="hero"><div class="eyebrow">3 · Les options</div><h2>Quelles sont les options que tu compares&nbsp;?</h2></div>'+ 
      '<div class="field"><label>Option A</label><input id="optionA" type="text" placeholder="Ex. Accepter le poste" value="'+escapeHtml(data.optionA||"")+'"></div>'+ 
      '<div class="field"><label>Option B</label><input id="optionB" type="text" placeholder="Ex. Rester dans mon poste actuel" value="'+escapeHtml(data.optionB||"")+'"></div>'+ 
      '<div class="field"><label>Option C <span class="muted">(facultatif)</span></label><input id="optionC" type="text" placeholder="Une troisième voie ?" value="'+escapeHtml(data.optionC||"")+'"></div>'+nav(false);
    }
    if(step==="priorities"){
      var selected=data.priorities||[];
      c.innerHTML='<div class="hero"><div class="eyebrow">4 · Ce qui compte</div><h2>Choisis jusqu’à 3 priorités pour cette décision.</h2><p class="muted">Pas tes valeurs “en général” : celles qui comptent ici, maintenant.</p></div><div class="chips">'+priorities.map(function(x){return '<button class="chip '+(selected.indexOf(x)>=0?'selected':'')+'" data-priority="'+x+'">'+x+'</button>'}).join("")+'</div><div class="counter" id="priorityCounter">'+selected.length+' / 3</div>'+nav(false);
    }
    if(step==="compassA" || step==="compassB"){
      var isA=step==="compassA", key=isA?"compassA":"compassB", option=isA?data.optionA:data.optionB, val=data[key]||{};
      c.innerHTML='<div class="hero"><div class="eyebrow">5 · La Boussole</div><h2>'+escapeHtml(option||("Option "+(isA?"A":"B")))+'</h2><p class="muted">Regarde cette option sous quatre angles, sans chercher à conclure.</p></div>'+ 
      '<div class="compass">'+
      q("gain","J’y gagne",val.gain,"Ce que cette option m’apporte…")+
      q("loss","J’y renonce",val.loss,"Ce que je laisse ou sacrifie…")+
      q("attract","Ça m’attire",val.attract,"Ce qui me donne envie…")+
      q("worry","Ça m’inquiète",val.worry,"Ce qui me freine ou m’effraie…")+
      '</div>'+nav(false);
    }
    if(step==="facts"){
      c.innerHTML='<div class="hero"><div class="eyebrow">6 · Faits vs anticipations</div><h2>Qu’est-ce qui est certain, et qu’est-ce que ton esprit complète&nbsp;?</h2></div>'+ 
      '<div class="card soft-green"><div class="field"><label>Ce que je sais réellement</label><textarea id="factsText" placeholder="Faits observables, informations vérifiées…">'+escapeHtml(data.facts||"")+'</textarea></div></div>'+ 
      '<div class="card coral"><div class="field"><label>Ce que j’imagine ou anticipe</label><textarea id="assumptionsText" placeholder="Peurs, suppositions, scénarios possibles…">'+escapeHtml(data.assumptions||"")+'</textarea></div></div>'+nav(false);
    }
    if(step==="branch"){
      var needsInfo=(data.difficulty||"").indexOf("informations")>=0;
      c.innerHTML='<div class="hero"><div class="eyebrow">7 · '+(needsInfo?'Information':'Risque')+'</div><h2>'+(needsInfo?'Quelle information changerait vraiment ta décision ?':'Si ton scénario redouté arrivait, à quel point serait-il récupérable ?')+'</h2></div>'+ 
      (needsInfo?
        '<div class="field"><label>L’information qui me manque</label><textarea id="branchText" placeholder="Ex. connaître les horaires réels, parler à quelqu’un qui fait déjà ce métier…">'+escapeHtml(data.branchText||"")+'</textarea></div>':
        '<div class="field"><label>Ce que je crains précisément</label><textarea id="branchText" placeholder="Ex. regretter mon choix, perdre de l’argent, décevoir quelqu’un…">'+escapeHtml(data.branchText||"")+'</textarea></div>'+ 
        '<div class="choices">'+["Difficilement récupérable","Récupérable avec effort","Plutôt récupérable","Je ne sais pas encore"].map(function(x){return '<button class="choice '+(data.recoverability===x?'selected':'')+'" data-recover="'+x+'">'+x+'</button>'}).join("")+'</div>'
      )+nav(false);
    }
    if(step==="reversible"){
      c.innerHTML='<div class="hero"><div class="eyebrow">8 · Réversibilité</div><h2>Si tu savais que tu pouvais changer d’avis plus tard, qu’aurais-tu envie d’essayer&nbsp;?</h2></div><div class="field"><textarea id="reversibleText" placeholder="Une option, une version temporaire, un test…">'+escapeHtml(data.reversible||"")+'</textarea></div><div class="insight">Une décision n’a pas toujours besoin d’être définitive. Parfois, le meilleur prochain pas est une expérience qui donne de vraies informations.</div>'+nav(false);
    }
    if(step==="information"){
      c.innerHTML='<div class="hero"><div class="eyebrow">9 · Avant de trancher</div><h2>De quoi as-tu encore besoin pour y voir plus clair&nbsp;?</h2></div><div class="field"><textarea id="infoText" placeholder="Une discussion, un chiffre, une journée d’essai, du temps, rien de plus…">'+escapeHtml(data.information||"")+'</textarea></div>'+nav(false);
    }
    if(step==="action"){
      c.innerHTML='<div class="hero"><div class="eyebrow">10 · Prochain pas</div><h2>Quel petit pas concret peux-tu faire maintenant&nbsp;?</h2><p class="muted">Il doit être suffisamment petit pour produire de l’information ou du mouvement.</p></div>'+ 
      '<div class="field"><label>Mon prochain pas</label><input id="actionText" type="text" placeholder="Ex. Appeler Léa pour lui poser 3 questions" value="'+escapeHtml(data.action||"")+'"></div>'+ 
      '<div class="field"><label>Quand ?</label><input id="actionDate" type="date" value="'+escapeHtml(data.actionDate||"")+'"></div>'+nav(false);
    }
    if(step==="summary"){
      var pa=(data.priorities||[]).join(" · ")||"—";
      c.innerHTML='<div class="hero"><div class="eyebrow">Ta clarté du moment</div><h2>Tu n’as peut-être pas encore la réponse. Mais tu as maintenant une carte.</h2></div>'+ 
      '<div class="summary-grid">'+
      sitem("Décision",data.decision)+sitem("Priorités",pa)+
      sitem("Option A",data.optionA)+sitem("Option B",data.optionB)+
      sitem("Ce qui est vérifié",data.facts)+sitem("Ce que tu anticipes",data.assumptions)+
      sitem("Ce qui t’attire vers A",(data.compassA||{}).attract)+sitem("Ce qui t’attire vers B",(data.compassB||{}).attract)+
      '</div>'+ 
      '<div class="card soft-green"><div class="eyebrow">Prochain pas</div><h3>'+escapeHtml(data.action||"À définir")+'</h3><p>'+(data.actionDate?formatDate(data.actionDate):"Sans date définie")+'</p></div>'+ 
      '<div class="insight">'+buildInsight()+'</div>'+ 
      '<button class="cta" id="finishFlow">Enregistrer dans Mon parcours</button><div style="height:10px"></div><button class="secondary" id="editFlow">Modifier une réponse</button>';
    }

    bindStep(step);
    updateNextState(step);
    syncStickyOffset();
    requestAnimationFrame(function(){ window.scrollTo(0,0); });
  }
  function q(id,title,val,ph){return '<div class="quadrant"><label>'+title+'</label><textarea data-compass="'+id+'" placeholder="'+ph+'">'+escapeHtml(val||"")+'</textarea></div>';}
  function sitem(t,v){return '<div class="summary-item"><b>'+escapeHtml(t)+'</b><span>'+escapeHtml(v||"—")+'</span></div>'}
  function buildInsight(){
    var p=(data.priorities||[]);
    var text="Ta décision semble surtout se jouer autour de ";
    if(p.length) text+=escapeHtml(p.slice(0,3).join(", "))+". ";
    else text+="ce qui compte le plus pour toi. ";
    if(data.information) text+="Avant de chercher une certitude totale, ton prochain pas peut servir à obtenir une information réelle.";
    else text+="Ton prochain pas n’a pas besoin de résoudre toute la décision : il doit simplement t’aider à avancer avec plus de réalité et moins de suppositions.";
    return text;
  }
  function bindStep(step){
    var back=document.getElementById("backStep");
    if(back) back.addEventListener("click",function(){capture(step); if(currentStep>0){currentStep--;renderStep()}});
    var next=document.getElementById("nextStep");
    if(next) next.addEventListener("click",function(){capture(step); if(validate(step)){currentStep++;renderStep()}else{updateNextState(step,true)}});

    document.querySelectorAll("[data-difficulty]").forEach(function(b){
      b.addEventListener("click",function(){
        data.difficulty=difficulties[Number(b.dataset.difficulty)];
        document.querySelectorAll("[data-difficulty]").forEach(function(x){x.classList.remove("selected")});
        b.classList.add("selected");save();updateNextState(step);
      });
    });
    document.querySelectorAll("[data-priority]").forEach(function(b){
      b.addEventListener("click",function(){
        var arr=data.priorities||[], v=b.dataset.priority, idx=arr.indexOf(v);
        if(idx>=0) arr.splice(idx,1); else if(arr.length<3) arr.push(v);
        data.priorities=arr;
        b.classList.toggle("selected",arr.indexOf(v)>=0);
        document.getElementById("priorityCounter").textContent=arr.length+" / 3";
        save();updateNextState(step);
      });
    });
    document.querySelectorAll("[data-recover]").forEach(function(b){
      b.addEventListener("click",function(){
        data.recoverability=b.dataset.recover;
        document.querySelectorAll("[data-recover]").forEach(function(x){x.classList.remove("selected")});
        b.classList.add("selected");save();updateNextState(step);
      });
    });
    document.querySelectorAll("input,textarea").forEach(function(el){
      el.addEventListener("input",function(){capture(step);save();updateNextState(step)});
      el.addEventListener("change",function(){capture(step);save();updateNextState(step)});
    });
    var finish=document.getElementById("finishFlow");
    if(finish) finish.addEventListener("click",finishSession);
    var edit=document.getElementById("editFlow");
    if(edit) edit.addEventListener("click",function(){currentStep=1;renderStep()});
  }
  function capture(step){
    function v(id){var el=document.getElementById(id);return el?el.value.trim():""}
    if(step==="decision") data.decision=v("decisionText");
    if(step==="options"){data.optionA=v("optionA");data.optionB=v("optionB");data.optionC=v("optionC")}
    if(step==="compassA"||step==="compassB"){
      var obj={};document.querySelectorAll("[data-compass]").forEach(function(el){obj[el.dataset.compass]=el.value.trim()});data[step]=obj;
    }
    if(step==="facts"){data.facts=v("factsText");data.assumptions=v("assumptionsText")}
    if(step==="branch") data.branchText=v("branchText");
    if(step==="reversible") data.reversible=v("reversibleText");
    if(step==="information") data.information=v("infoText");
    if(step==="action"){data.action=v("actionText");data.actionDate=v("actionDate")}
  }
  function validate(step){
    if(step==="decision") return !!data.decision;
    if(step==="difficulty") return !!data.difficulty;
    if(step==="options") return !!data.optionA && !!data.optionB;
    if(step==="priorities") return (data.priorities||[]).length>0;
    if(step==="action") return !!data.action;
    return true;
  }
  function updateNextState(step,shake){
    var next=document.getElementById("nextStep"); if(!next)return;
    capture(step);
    next.disabled=!validate(step);
  }
  function finishSession(){
    var h=getHistory();
    h.unshift({
      id:Date.now(), createdAt:new Date().toISOString(), decision:data.decision||"", difficulty:data.difficulty||"",
      optionA:data.optionA||"", optionB:data.optionB||"", priorities:data.priorities||[], facts:data.facts||"",
      assumptions:data.assumptions||"", compassA:data.compassA||{}, compassB:data.compassB||{}, information:data.information||"",
      action:data.action||"", actionDate:data.actionDate||"", learned:"", done:false
    });
    setHistory(h); clearCurrent(); showScreen("journey");
  }
  function formatDate(iso){
    if(!iso)return "";
    var d=new Date(iso+"T12:00:00");
    return d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  }
  function renderJourney(){
    var host=document.getElementById("journeyList"), h=getHistory();
    if(!h.length){
      host.innerHTML='<div class="empty"><h3>Ton parcours commence ici.</h3><p class="muted">Après un exercice, ta synthèse et ton prochain pas apparaîtront ici.</p><button class="cta" data-empty-start>Faire la Boussole du choix</button></div>';
      var b=host.querySelector("[data-empty-start]");if(b)b.onclick=function(){startDecision(true)};
      return;
    }
    host.innerHTML=h.map(function(s){
      return '<div class="session"><div class="date">'+new Date(s.createdAt).toLocaleDateString("fr-FR")+'</div><h3>'+escapeHtml(s.decision)+'</h3>'+ 
      '<p><b>Prochain pas :</b> '+escapeHtml(s.action||"—")+(s.actionDate?' · '+formatDate(s.actionDate):'')+'</p>'+ 
      '<p class="muted">Priorités : '+escapeHtml((s.priorities||[]).join(" · ")||"—")+'</p>'+ 
      (s.learned?'<div class="card cream"><b>Ce que ça m’a appris</b><p>'+escapeHtml(s.learned)+'</p></div>':'')+ 
      '<div class="session-actions"><button class="mini '+(s.done?'done':'')+'" data-done="'+s.id+'">'+(s.done?'✓ Fait':'Je l’ai fait ✓')+'</button><button class="mini" data-learn="'+s.id+'">Ce que ça m’a appris</button></div></div>';
    }).join("");
    host.querySelectorAll("[data-done]").forEach(function(b){b.onclick=function(){toggleDone(Number(b.dataset.done))}});
    host.querySelectorAll("[data-learn]").forEach(function(b){b.onclick=function(){addLearning(Number(b.dataset.learn))}});
  }
  function toggleDone(id){var h=getHistory();h=h.map(function(s){if(s.id===id)s.done=!s.done;return s});setHistory(h);renderJourney();}
  function addLearning(id){
    var h=getHistory(), s=h.find(function(x){return x.id===id});if(!s)return;
    var answer=window.prompt("Qu’est-ce que cette action t’a appris ?",s.learned||"");
    if(answer!==null){s.learned=answer.trim();setHistory(h);renderJourney()}
  }

  document.querySelectorAll("[data-tab]").forEach(function(b){b.addEventListener("click",function(){showScreen(b.dataset.tab)})});
  document.querySelectorAll("[data-start]").forEach(function(b){b.addEventListener("click",function(){startDecision(true)})});
  document.querySelectorAll("[data-soon]").forEach(function(b){b.addEventListener("click",function(){window.alert("Ce parcours arrivera après validation de la Boussole du choix. Pour cette V0, on teste d’abord si l’expérience Décision apporte réellement de la clarté.")})});
  document.getElementById("resumeBtn").addEventListener("click",function(){startDecision(false)});
  document.getElementById("resetBtn").addEventListener("click",function(){
    if(window.confirm("Recommencer ce parcours ? Tes réponses en cours seront effacées.")){clearCurrent();startDecision(true)}
  });
  document.getElementById("eraseBtn").addEventListener("click",function(){
    if(window.confirm("Effacer toutes les données locales de Clarity sur cet appareil ?")){localStorage.removeItem(STORAGE);localStorage.removeItem(HISTORY);data={};currentStep=0;renderJourney();document.getElementById("resumeCard").classList.add("hidden");window.alert("Les données locales ont été effacées.")}
  });
  window.addEventListener("resize",syncStickyOffset);
  load();
  syncStickyOffset();
})();
