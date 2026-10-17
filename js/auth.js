/**
 * auth.js - Frontend JWT Authentication Module
 * Electric Vehicle Market Performance & Insights
 */
(function EVAuth() {
  "use strict";

  // Base64URL encode
  function b64url(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    try { return decodeURIComponent(escape(atob(str))); } catch { return null; }
  }

  const JWT_SECRET = "ev-insights-analytics-2024";

  async function signJWT(payload) {
    const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body   = b64url(JSON.stringify(payload));
    const msg    = header + "." + body;
    const enc    = new TextEncoder();
    const key    = await crypto.subtle.importKey(
      "raw", enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig  = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
    const sigB = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return msg + "." + sigB;
  }

  async function verifyJWT(token) {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const msg = parts[0] + "." + parts[1];
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
    const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (expected !== parts[2]) return null;
    const payloadStr = b64urlDecode(parts[1]);
    if (!payloadStr) return null;
    const p = JSON.parse(payloadStr);
    if (p.exp && Date.now() / 1000 > p.exp) return null;
    return p;
  }

  const USERS_KEY = "ev_auth_users";
  const TOKEN_KEY = "ev_auth_token";

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function hashPw(pw) {
    let h = 0x811c9dc5;
    for (let i = 0; i < pw.length; i++) {
      h ^= pw.charCodeAt(i);
      h = (Math.imul(h, 0x01000193)) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }

  const $ = id => document.getElementById(id);

  const modal      = $("modal-auth");
  const btnOpen    = $("btn-auth-open");
  const btnClose   = $("btn-auth-close");
  const userPill   = $("auth-user-pill");
  const avatarEl   = $("auth-avatar-initials");
  const usernameEl = $("auth-username-label");
  const btnSignout = $("btn-auth-signout");
  const msgEl      = $("auth-message");
  const tabSignin  = $("auth-tab-signin");
  const tabSignup  = $("auth-tab-signup");
  const formSignin = $("form-signin");
  const formSignup = $("form-signup");

  function openModal(tab) {
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    switchTab(tab || "signin");
    clearMsg();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    clearMsg();
    if (formSignin) formSignin.reset();
    if (formSignup) formSignup.reset();
  }

  function switchTab(tab) {
    if (!tabSignin || !tabSignup || !formSignin || !formSignup) return;
    if (tab === "signin") {
      tabSignin.classList.add("active");
      tabSignup.classList.remove("active");
      formSignin.style.display = "";
      formSignup.style.display = "none";
    } else {
      tabSignup.classList.add("active");
      tabSignin.classList.remove("active");
      formSignup.style.display = "";
      formSignin.style.display = "none";
    }
    clearMsg();
  }

  function showMsg(txt, type) {
    if (!msgEl) return;
    msgEl.textContent = txt;
    msgEl.className = "auth-message auth-message-" + (type || "error");
    msgEl.style.display = "";
  }
  function clearMsg() {
    if (msgEl) { msgEl.style.display = "none"; msgEl.textContent = ""; }
  }

  function updateNav(user) {
    if (!btnOpen || !userPill) return;
    if (user) {
      btnOpen.style.display = "none";
      userPill.style.display = "";
      const initials = user.name
        ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : user.email.slice(0, 2).toUpperCase();
      if (avatarEl)   avatarEl.textContent   = initials;
      if (usernameEl) usernameEl.textContent = user.name || user.email.split("@")[0];
    } else {
      btnOpen.style.display = "";
      userPill.style.display = "none";
    }
  }

  async function checkSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { updateNav(null); return; }
    const p = await verifyJWT(token);
    if (p) { updateNav({ name: p.name, email: p.email }); }
    else   { localStorage.removeItem(TOKEN_KEY); updateNav(null); }
  }

  async function handleSignIn(e) {
    e.preventDefault(); clearMsg();
    const email = ($("signin-email")?.value || "").trim().toLowerCase();
    const pw    = $("signin-password")?.value || "";
    if (!email || !pw) { showMsg("Please fill in all fields."); return; }
    const user = getUsers().find(u => u.email === email);
    if (!user || user.pwHash !== hashPw(pw)) { showMsg("Incorrect email or password."); return; }
    const token = await signJWT({ sub: user.id, email: user.email, name: user.name,
      iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 604800 });
    localStorage.setItem(TOKEN_KEY, token);
    updateNav(user);
    showMsg("Welcome back, " + (user.name || user.email.split("@")[0]) + "!", "success");
    setTimeout(closeModal, 1200);
  }

  async function handleSignUp(e) {
    e.preventDefault(); clearMsg();
    const name  = ($("signup-name")?.value || "").trim();
    const email = ($("signup-email")?.value || "").trim().toLowerCase();
    const pw    = $("signup-password")?.value || "";
    if (!name || !email || !pw)               { showMsg("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg("Enter a valid email."); return; }
    if (pw.length < 6)                         { showMsg("Password must be at least 6 characters."); return; }
    const users = getUsers();
    if (users.find(u => u.email === email))   { showMsg("This email is already registered."); return; }
    const nu = { id: (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      name, email, pwHash: hashPw(pw), createdAt: new Date().toISOString() };
    users.push(nu); saveUsers(users);
    const token = await signJWT({ sub: nu.id, email: nu.email, name: nu.name,
      iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 604800 });
    localStorage.setItem(TOKEN_KEY, token);
    updateNav(nu);
    showMsg("Account created! Welcome, " + name + " \uD83C\uDF89", "success");
    setTimeout(closeModal, 1400);
  }

  function toggleEye(inputId, btnId) {
    const inp = $(inputId), btn = $(btnId);
    if (!inp || !btn) return;
    btn.addEventListener("click", () => { inp.type = inp.type === "password" ? "text" : "password"; });
  }

  function init() {
    if (btnOpen)    btnOpen.addEventListener("click",    () => openModal("signin"));
    if (btnClose)   btnClose.addEventListener("click",   closeModal);
    if (btnSignout) btnSignout.addEventListener("click", () => { localStorage.removeItem(TOKEN_KEY); updateNav(null); });
    if (modal)      modal.addEventListener("click",      e => { if (e.target === modal) closeModal(); });
    if (tabSignin)  tabSignin.addEventListener("click",  () => switchTab("signin"));
    if (tabSignup)  tabSignup.addEventListener("click",  () => switchTab("signup"));
    document.querySelectorAll(".auth-switch-link").forEach(l =>
      l.addEventListener("click", () => switchTab(l.dataset.switch)));
    if (formSignin) formSignin.addEventListener("submit", handleSignIn);
    if (formSignup) formSignup.addEventListener("submit", handleSignUp);
    toggleEye("signin-password", "eye-signin");
    toggleEye("signup-password", "eye-signup");
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal?.classList.contains("active")) closeModal(); });
    checkSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
