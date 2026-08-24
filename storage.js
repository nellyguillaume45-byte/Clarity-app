(function(){
"use strict";
var DRAFTS=[
  "clarity_v0_state",
  "clarity_v0_confidence_state",
  "clarity_v0_procrastination_state",
  "clarity_v0_lost_state",
  "clarity_v0_rumination_state",
  "clarity_v0_limits_state"
];
var ROUTES=[
  {selector:'[data-start="decision"]',keep:"clarity_v0_state"},
  {selector:"[data-confidence-start]",keep:"clarity_v0_confidence_state"},
  {selector:"[data-pro-start]",keep:"clarity_v0_procrastination_state"},
  {selector:"[data-lost-start]",keep:"clarity_v0_lost_state"},
  {selector:"[data-rumination-start]",keep:"clarity_v0_rumination_state"},
  {selector:"[data-limits-start]",keep:"clarity_v0_limits_state"}
];
function clearExcept(keep){DRAFTS.forEach(function(k){if(k!==keep)localStorage.removeItem(k)});}
document.addEventListener("click",function(e){
  var target=e.target;
  if(!target||!target.closest)return;
  var erase=target.closest("#eraseBtn");
  if(erase){
    e.preventDefault();
    e.stopImmediatePropagation();
    if(window.confirm("Effacer toutes les données locales de Clarity sur cet appareil ?")){
      DRAFTS.forEach(function(k){localStorage.removeItem(k)});
      localStorage.removeItem("clarity_v0_history");
      window.location.reload();
    }
    return;
  }
  ROUTES.some(function(r){
    if(target.closest(r.selector)){
      clearExcept(r.keep);
      return true;
    }
    return false;
  });
},true);
})();