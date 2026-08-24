(function(){
"use strict";
var DRAFTS=[
  "clarity_v0_state",
  "clarity_v0_confidence_state",
  "clarity_v0_procrastination_state",
  "clarity_v0_lost_state",
  "clarity_v0_rumination_state"
];
document.addEventListener("click",function(e){
  var target=e.target;
  var button=target&&target.closest?target.closest("#eraseBtn"):null;
  if(!button)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if(window.confirm("Effacer toutes les données locales de Clarity sur cet appareil ?")){
    DRAFTS.forEach(function(k){localStorage.removeItem(k)});
    localStorage.removeItem("clarity_v0_history");
    window.location.reload();
  }
},true);
})();