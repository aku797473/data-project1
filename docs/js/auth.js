/**
 * auth.js - Enhanced Enterprise Authentication Module
 * Supports Email, Phone Number, Password, and Google 1-Click Sign-In
 */
(function EVAuth() {
  "use strict";

  function b64url(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64urlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    try { return decodeURIComponent(escape(atob(str))); } catch { return null; }
  }

  const JWT_SECRET = "ev-insights-analytics-2026-secure-jwt";

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
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* empty */ }
    // Default demo user
    const def = [{
      id: "demo-user-1",
      name: "Alex Morgan",
      identifier: "demo@ev-analytics.com",
      phone: "+91 98765 43210",
      pwHash: hashPw("demo1234"),
      createdAt: new Date().toISOString()
    }];
    saveUsers(def);
    return def;
  }

  function saveUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* empty */ }
  }

  function hashPw(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }

  const $ = id => document.getElementById(id);

  function showMsg(text, type = "error") {
    const box = $("auth-msg");
    if (!box) return;
    box.textContent = text;
    box.className = "auth-msg visible " + type;
  }

  function clearMsg() {
    const box = $("auth-msg");
    if (box) { box.textContent = ""; box.className = "auth-msg"; }
  }

  function openModal(tab = "signin") {
    clearMsg();
    const modal = $("auth-modal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      switchTab(tab);
    }
  }

  function closeModal() {
    const modal = $("auth-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function switchTab(tab) {
    clearMsg();
    const tabIn = $("tab-signin"), tabUp = $("tab-signup");
    const paneIn = $("pane-signin"), paneUp = $("pane-signup");
    if (!tabIn || !tabUp || !paneIn || !paneUp) return;

    if (tab === "signin") {
      tabIn.classList.add("active");
      tabUp.classList.remove("active");
      paneIn.classList.add("active");
      paneUp.classList.remove("active");
      setTimeout(() => $("signin-identifier")?.focus(), 100);
    } else {
      tabUp.classList.add("active");
      tabIn.classList.remove("active");
      paneUp.classList.add("active");
      paneIn.classList.remove("active");
      setTimeout(() => $("signup-name")?.focus(), 100);
    }
  }

  function updateNav(user) {
    const btnOpen = $("btn-auth-open");
    const userPill = $("auth-user-pill");
    const label = $("auth-username-label");
    const avatar = $("auth-avatar-initials");

    if (user) {
      if (btnOpen) btnOpen.style.display = "none";
      if (userPill) userPill.style.display = "inline-flex";
      const displayName = user.name || user.identifier || "Analyst";
      if (label) label.textContent = displayName.split(" ")[0];
      if (avatar) {
        const parts = displayName.trim().split(" ");
        avatar.textContent = parts.length > 1
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : parts[0].slice(0, 2).toUpperCase();
      }
    } else {
      if (btnOpen) btnOpen.style.display = "inline-flex";
      if (userPill) userPill.style.display = "none";
    }
  }

  async function checkSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { updateNav(null); return; }
    const p = await verifyJWT(token);
    if (p) { updateNav({ name: p.name, identifier: p.identifier }); }
    else   { localStorage.removeItem(TOKEN_KEY); updateNav(null); }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    clearMsg();
    const identifier = ($("signin-identifier")?.value || "").trim().toLowerCase();
    const pw = $("signin-password")?.value || "";

    if (!identifier || !pw) {
      showMsg("Please enter your email/phone and password.");
      return;
    }

    const users = getUsers();
    const user = users.find(u =>
      (u.identifier && u.identifier.toLowerCase() === identifier) ||
      (u.phone && u.phone.replace(/\s+/g, "") === identifier.replace(/\s+/g, ""))
    );

    if (!user || user.pwHash !== hashPw(pw)) {
      showMsg("Incorrect Email/Phone or Password.");
      return;
    }

    const token = await signJWT({
      sub: user.id,
      identifier: user.identifier || user.phone,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 604800
    });

    localStorage.setItem(TOKEN_KEY, token);
    updateNav(user);
    showMsg(`Welcome back, ${user.name || "Analyst"}! ✨`, "success");
    setTimeout(closeModal, 1000);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    clearMsg();
    const name = ($("signup-name")?.value || "").trim();
    const identifier = ($("signup-identifier")?.value || "").trim();
    const pw = $("signup-password")?.value || "";

    if (!name || !identifier || !pw) {
      showMsg("Please fill in all required fields.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[+]?[\d\s-]{8,15}$/.test(identifier);

    if (!isEmail && !isPhone) {
      showMsg("Enter a valid Email address or Phone number.");
      return;
    }

    if (pw.length < 6) {
      showMsg("Password must be at least 6 characters.");
      return;
    }

    const users = getUsers();
    const exists = users.find(u =>
      (u.identifier && u.identifier.toLowerCase() === identifier.toLowerCase()) ||
      (u.phone && u.phone === identifier)
    );

    if (exists) {
      showMsg("An account with this Email/Phone already exists.");
      return;
    }

    const nu = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
      name,
      identifier: isEmail ? identifier.toLowerCase() : "",
      phone: isPhone ? identifier : "",
      pwHash: hashPw(pw),
      createdAt: new Date().toISOString()
    };

    users.push(nu);
    saveUsers(users);

    const token = await signJWT({
      sub: nu.id,
      identifier: nu.identifier || nu.phone,
      name: nu.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 604800
    });

    localStorage.setItem(TOKEN_KEY, token);
    updateNav(nu);
    showMsg(`Account created! Welcome, ${name} 🎉`, "success");
    setTimeout(closeModal, 1200);
  }

  // Simulated Google One-Click Auth
  async function handleGoogleAuth() {
    clearMsg();
    showMsg("Connecting to Google...", "info");
    setTimeout(async () => {
      const googleUser = {
        id: "google-" + Date.now().toString(36),
        name: "Google User",
        identifier: "user@gmail.com",
        phone: "",
        createdAt: new Date().toISOString()
      };
      const token = await signJWT({
        sub: googleUser.id,
        identifier: googleUser.identifier,
        name: googleUser.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800
      });
      localStorage.setItem(TOKEN_KEY, token);
      updateNav(googleUser);
      showMsg("Signed in with Google! Welcome ✨", "success");
      setTimeout(closeModal, 1000);
    }, 700);
  }

  function toggleEye(inputId, btnId) {
    const inp = $(inputId), btn = $(btnId);
    if (!inp || !btn) return;
    btn.addEventListener("click", () => {
      inp.type = inp.type === "password" ? "text" : "password";
      btn.style.opacity = inp.type === "text" ? "1" : "0.6";
    });
  }

  function init() {
    const btnOpen = $("btn-auth-open");
    const btnClose = $("auth-modal-close");
    const btnSignout = $("btn-auth-signout");
    const modal = $("auth-modal");
    const tabSignin = $("tab-signin");
    const tabSignup = $("tab-signup");
    const formSignin = $("form-signin");
    const formSignup = $("form-signup");
    const btnGoogle = $("btn-google-auth");

    if (btnOpen) btnOpen.addEventListener("click", () => openModal("signin"));
    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnSignout) {
      btnSignout.addEventListener("click", () => {
        localStorage.removeItem(TOKEN_KEY);
        updateNav(null);
      });
    }
    if (modal) {
      modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    }
    if (tabSignin) tabSignin.addEventListener("click", () => switchTab("signin"));
    if (tabSignup) tabSignup.addEventListener("click", () => switchTab("signup"));

    document.querySelectorAll(".auth-switch-link").forEach(l => {
      l.addEventListener("click", () => switchTab(l.dataset.switch));
    });

    if (formSignin) formSignin.addEventListener("submit", handleSignIn);
    if (formSignup) formSignup.addEventListener("submit", handleSignUp);
    if (btnGoogle) btnGoogle.addEventListener("click", handleGoogleAuth);

    toggleEye("signin-password", "eye-signin");
    toggleEye("signup-password", "eye-signup");

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal?.classList.contains("active")) closeModal();
    });

    checkSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
