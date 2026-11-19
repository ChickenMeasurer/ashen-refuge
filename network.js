// Leave empty "" for local testing (http://localhost:8000).
// Before pushing to GitHub Pages, paste your Cloudflare Tunnel URL here (no trailing slash):
const API_BASE = "https://bracelet-pvc-asus-craig.trycloudflare.com"; // e.g. "https://ashen-api.yourdomain.com"

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function wsUrl() {
  if (!API_BASE) {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${location.host}/ws`;
  }
  return API_BASE.replace(/^http/, "ws") + "/ws";
}

export class VillageNetwork {
  constructor(handlers) {
    this.handlers = handlers;
    this.ws = null;
    this.user = null;
  }

  async fetchWorld() {
    const res = await fetch(apiUrl("/api/world"));
    return await res.json();
  }

  async auth(mode, username, password, playerClass) {
    const endpoint = mode === "signup" ? apiUrl("/api/signup") : apiUrl("/api/login");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, player_class: playerClass }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Authentication failed");
    this.user = data.user;
    localStorage.setItem("ashen_session", JSON.stringify({ username, password }));
    this.send({ type: "join", username: this.user.username });
    return this.user;
  }

  async tryAutoLogin() {
    const raw = localStorage.getItem("ashen_session");
    if (!raw) return null;
    try {
      const saved = JSON.parse(raw);
      return await this.auth("login", saved.username, saved.password);
    } catch {
      localStorage.removeItem("ashen_session");
      return null;
    }
  }

  logout() {
    localStorage.removeItem("ashen_session");
    this.user = null;
  }

  async unlockCreator(passcode) {
    if (!this.user) return;
    const res = await fetch(apiUrl("/api/admin/unlock"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.user.username, passcode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid passcode");
    this.user = data.user;
    return this.user;
  }

  async summonBatch(rawText) {
    const res = await fetch(apiUrl("/api/admin/summon-batch"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.user.username, raw_text: rawText }),
    });
    return await res.json();
  }

  async deleteNpc(id) {
    await fetch(apiUrl(`/api/admin/npc/${id}?username=${encodeURIComponent(this.user.username)}`), {
      method: "DELETE",
    });
  }

  async useItem(itemId) {
    const res = await fetch(apiUrl("/api/inventory/use"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.user.username, item_id: itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Cannot use item");
    if (data.user) this.user = data.user;
    return data.user;
  }

  async discardItem(itemId) {
    const res = await fetch(apiUrl("/api/inventory/discard"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.user.username, item_id: itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Cannot discard item");
    if (data.user) this.user = data.user;
    return data.user;
  }

  async buyItem(itemId) {
    const res = await fetch(apiUrl("/api/inventory/buy"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.user.username, item_id: itemId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Not enough Souls");
    if (data.user) this.user = data.user;
    return data.user;
  }

  async grantItem(targetUsername, itemId, qty = 1) {
    const res = await fetch(apiUrl("/api/admin/grant-item"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_username: this.user.username,
        target_username: targetUsername,
        item_id: itemId,
        qty,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Grant failed");
    return data.user;
  }

  async placeSoapstone(templateText, x, y) {
    const res = await fetch(apiUrl("/api/soapstones"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author_name: this.user.username,
        template_text: templateText,
        x,
        y,
      }),
    });
    const data = await res.json();
    if (data.user) this.user = data.user;
    return data;
  }

  async appraiseSoapstone(id) {
    const res = await fetch(apiUrl(`/api/soapstones/${id}/appraise`), { method: "POST" });
    return await res.json();
  }

  connectWS() {
    this.ws = new WebSocket(wsUrl());

    this.ws.onopen = () => {
      if (this.user) {
        this.send({ type: "join", username: this.user.username });
      }
    };

    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      this.handlers.onMessage(msg);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connectWS(), 2000);
    };
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}
