import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAn9F8ZtesawNAy2El7__Dl-toOi1JNC-U",
  authDomain: "clarity7245.firebaseapp.com",
  projectId: "clarity7245",
  storageBucket: "clarity7245.firebasestorage.app",
  messagingSenderId: "937532569759",
  appId: "1:937532569759:web:48a9a83dc3d691e9338aaa",
  measurementId: "G-8M8JK67XRT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char];
  });
}

function ensureStyles() {
  if (document.getElementById("clarityAuthStyles")) return;
  const style = document.createElement("style");
  style.id = "clarityAuthStyles";
  style.textContent = `
    .auth-card{margin-top:4px}
    .auth-google{display:flex;align-items:center;justify-content:center;gap:10px}
    .auth-google-mark{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#0D1B2A;font-weight:900;font-size:15px}
    .auth-profile{display:grid;grid-template-columns:54px 1fr;gap:14px;align-items:center;margin:8px 0 18px}
    .auth-avatar{width:54px;height:54px;border-radius:50%;object-fit:cover;background:#B6E3B9;border:2px solid #fff}
    .auth-avatar-fallback{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#B6E3B9;font-weight:850;font-size:21px}
    .auth-name{font-weight:850;font-size:18px;line-height:1.2}
    .auth-email{font-size:13px;opacity:.65;margin-top:4px;overflow-wrap:anywhere}
    .auth-state-note{font-size:13px;line-height:1.45;margin-top:12px;opacity:.72}
    .auth-error{font-size:13px;line-height:1.45;margin:12px 0 0;padding:12px 13px;border-radius:14px;background:#FCE9D2}
    .auth-success{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;background:#B6E3B9;border-radius:999px;padding:6px 9px;margin-bottom:12px}
  `;
  document.head.appendChild(style);
}

function ensureCard() {
  let card = document.getElementById("clarityAuthCard");
  if (card) return card;
  const me = document.getElementById("me");
  if (!me) return null;
  const hero = me.querySelector(".hero");
  card = document.createElement("div");
  card.id = "clarityAuthCard";
  card.className = "card soft-green auth-card";
  if (hero && hero.nextSibling) hero.parentNode.insertBefore(card, hero.nextSibling);
  else me.appendChild(card);
  return card;
}

function errorMessage(error) {
  const code = error && error.code ? error.code : "";
  if (code === "auth/unauthorized-domain") {
    return "Ce domaine n’est pas encore autorisé dans Firebase. Ajoute nellyguillaume45-byte.github.io dans Authentication → Settings → Authorized domains.";
  }
  if (code === "auth/operation-not-allowed") {
    return "La connexion Google n’est pas encore activée dans Firebase Authentication. Active le fournisseur Google puis réessaie.";
  }
  if (code === "auth/popup-blocked") {
    return "La fenêtre Google a été bloquée par le navigateur. Autorise les fenêtres pop-up pour Clarity puis réessaie.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Connexion annulée. Tu peux réessayer quand tu veux.";
  }
  return "La connexion n’a pas abouti. Réessaie dans quelques instants.";
}

function initials(user) {
  const source = (user && (user.displayName || user.email)) || "C";
  return source.trim().charAt(0).toUpperCase();
}

function renderSignedOut(message) {
  const card = ensureCard();
  if (!card) return;
  card.innerHTML = `
    <div class="eyebrow">Mon espace Clarity</div>
    <h3>Retrouve ton compte sur tes appareils</h3>
    <p>Connecte-toi avec ton compte Google. Lors de la première connexion, ton espace Clarity sera créé automatiquement.</p>
    <button class="cta auth-google" id="clarityGoogleSignIn" type="button">
      <span class="auth-google-mark">G</span>
      Continuer avec Google
    </button>
    ${message ? `<div class="auth-error">${esc(message)}</div>` : ""}
    <p class="auth-state-note">Pour le moment, tes réponses aux parcours restent enregistrées uniquement sur cet appareil. La connexion ne les envoie pas encore dans le cloud.</p>
  `;
  const button = document.getElementById("clarityGoogleSignIn");
  if (button) {
    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Connexion…";
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        renderSignedOut(errorMessage(error));
      }
    });
  }
}

function renderSignedIn(user) {
  const card = ensureCard();
  if (!card) return;
  const avatar = user.photoURL
    ? `<img class="auth-avatar" src="${esc(user.photoURL)}" alt="">`
    : `<div class="auth-avatar-fallback">${esc(initials(user))}</div>`;
  card.innerHTML = `
    <div class="auth-success">✓ Connecté(e)</div>
    <div class="auth-profile">
      ${avatar}
      <div>
        <div class="auth-name">${esc(user.displayName || "Mon espace Clarity")}</div>
        <div class="auth-email">${esc(user.email || "")}</div>
      </div>
    </div>
    <button class="secondary" id="claritySignOut" type="button">Se déconnecter</button>
    <p class="auth-state-note">Ton compte Google sert maintenant à t’identifier dans Clarity. La synchronisation de tes parcours entre appareils sera ajoutée séparément pour garder un contrôle clair sur tes données personnelles.</p>
  `;
  const button = document.getElementById("claritySignOut");
  if (button) {
    button.addEventListener("click", async function () {
      button.disabled = true;
      try {
        await signOut(auth);
      } catch (error) {
        button.disabled = false;
      }
    });
  }
}

function init() {
  ensureStyles();
  ensureCard();
  onAuthStateChanged(auth, function (user) {
    if (user) renderSignedIn(user);
    else renderSignedOut("");
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
