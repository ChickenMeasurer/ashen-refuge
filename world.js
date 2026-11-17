import { drawSiteOfGrace, drawProp, drawSoapstone, drawVillager } from "./sprites.js";
import { preloadCustomAssets, customWorlds } from "./assets_loader.js";
import { VillageNetwork } from "./network.js";

const canvas = document.getElementById("gameCanvas");
const shell = document.getElementById("canvas-shell");
const ctx = canvas.getContext("2d");

const WORLD_W = 1200;
const WORLD_H = 850;
const GRACE = { x: 600, y: 425 };

const props = [
  { type: "chapel", x: 600, y: 235 },
  { type: "arch", x: 375, y: 395 },
  { type: "arch", x: 825, y: 395 },
  { type: "lantern", x: 520, y: 345 },
  { type: "lantern", x: 680, y: 345 },
  { type: "lantern", x: 470, y: 505 },
  { type: "lantern", x: 730, y: 505 },
  { type: "tree", x: 270, y: 265 },
  { type: "tree", x: 930, y: 275 },
  { type: "tree", x: 280, y: 585 },
  { type: "tree", x: 920, y: 575 },
  { type: "grave", x: 430, y: 270 },
  { type: "grave", x: 455, y: 285 },
  { type: "grave", x: 755, y: 275 },
  { type: "grave", x: 780, y: 260 },
];

// Pre-seeded textured stones & grass tufts so the ground feels organic
const groundDetails = [];
for (let i = 0; i < 240; i++) {
  groundDetails.push({
    x: 160 + ((i * 73) % 880),
    y: 140 + ((i * 137) % 580),
    w: (i % 3) + 2,
    h: (i % 2) + 2,
    tone: i % 4,
  });
}

let npcs = [];
let players = new Map();
let soapstones = [];
let particles = [];
let atmosphere = "ash";
let tick = 0;
let keys = {};
let targetWaypoint = null;
let reelDirector = false;
let directorIndex = 0;
let directorTimer = 0;
let cam = { x: GRACE.x, y: GRACE.y, zoom: 1.5 };
let activeSoapstone = null;
let lastMoveSent = 0;

// Map  Mode state (Creator Sovereign only)
let Mode = false;
let PropType = "chapel";
let selectedProp = null;
let draggingProp = false;
const BUILDER_TYPES = ["chapel", "arch", "lantern", "tree", "grave", "boogersorcerer"];

function resize() {
  const rect = shell.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    ctx.imageSmoothingEnabled = false;
  }
}
new ResizeObserver(resize).observe(shell);
window.addEventListener("resize", resize);
resize();

const net = new VillageNetwork({
  onMessage(msg) {
    if (msg.type === "player_joined") {
      const p = msg.player;
      npcs = npcs.filter((n) => n.username.toLowerCase() !== p.username.toLowerCase());
      if (!net.user || p.username !== net.user.username) {
        players.set(p.username, { ...p, targetX: p.x, targetY: p.y, summonTimer: 90 });
      }
      updateHudCounts();
    } else if (msg.type === "player_left") {
      players.delete(msg.username);
      updateHudCounts();
    } else if (msg.type === "player_moved") {
      if (net.user && msg.username === net.user.username) return;
      const p = players.get(msg.username);
      if (p) {
        p.targetX = msg.x;
        p.targetY = msg.y;
      }
    } else if (msg.type === "player_chat") {
      const ent = getEntityByName(msg.username);
      if (ent) {
        ent.chatText = msg.text;
        ent.chatTimer = 260;
      }
    } else if (msg.type === "player_gesture") {
      const ent = getEntityByName(msg.username);
      if (ent) {
        ent.gesture = msg.gesture;
        ent.gestureTimer = 140;
      }
    } else if (msg.type === "npcs_summoned") {
      msg.npcs.forEach((n) => {
        npcs.push({ ...n, tx: n.x, ty: n.y, wait: 30, summonTimer: 90 });
      });
      renderNpcList();
      updateHudCounts();
    } else if (msg.type === "npc_removed") {
      npcs = npcs.filter((n) => n.id !== msg.id);
      renderNpcList();
      updateHudCounts();
    } else if (msg.type === "soapstone_added") {
      soapstones.unshift(msg.soapstone);
    } else if (msg.type === "soapstone_appraised") {
      const s = soapstones.find((item) => item.id === msg.soapstone.id);
      if (s) s.appraisals = msg.soapstone.appraisals;
    } else if (msg.type === "souls_updated") {
      if (net.user) {
        net.user.souls = msg.souls;
        document.getElementById("souls-pill").textContent = `🔥 ${msg.souls} Souls`;
      }
    } else if (msg.type === "world_event") {
      if (msg.event === "gather") {
        npcs.forEach((n) => {
          n.tx = GRACE.x + (Math.random() - 0.5) * 90;
          n.ty = GRACE.y + (Math.random() - 0.5) * 70;
          n.wait = 180;
        });
      } else {
        atmosphere = msg.event;
      }
      if (msg.banner) showBanner(msg.banner);
    }
  },
});

function getEntityByName(username) {
  if (net.user && net.user.username === username) return net.user;
  return players.get(username) || npcs.find((n) => n.username === username);
}

function updateHudCounts() {
  const total = npcs.length + players.size + (net.user ? 1 : 0);
  document.getElementById("online-pill").textContent = `● ${total} Tarnished`;
  document.getElementById("npc-count").textContent = npcs.length;
}

function showBanner(text) {
  const el = document.getElementById("souls-banner");
  document.getElementById("souls-banner-text").textContent = text;
  el.classList.remove("hidden");
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  setTimeout(() => el.classList.add("hidden"), 3600);
}

function renderNpcList() {
  const list = document.getElementById("npc-list");
  list.innerHTML = "";
  npcs.forEach((n) => {
    const row = document.createElement("div");
    row.className = "npc-item";
    row.innerHTML = `<span>${n.username} (${n.player_class})</span>`;
    const del = document.createElement("button");
    del.className = "btn-souls sm";
    del.textContent = "Banish";
    del.onclick = () => net.deleteNpc(n.id);
    row.appendChild(del);
    list.appendChild(row);
  });
}

function applyUserSession(user) {
  document.getElementById("player-dock").classList.remove("hidden");
  document.getElementById("souls-pill").textContent = `🔥 ${user.souls} Souls`;
  document.getElementById("btn-auth-open").textContent = `♦ ${user.username}`;
  document.getElementById("auth-forms").classList.add("hidden");
  document.getElementById("profile-panel").classList.remove("hidden");
  document.getElementById("profile-summary").textContent =
    `${user.username} — ${user.player_class} (${user.souls} Souls)`;
  if (user.is_admin) {
    document.getElementById("btn-creator-drawer").classList.remove("hidden");
    document.getElementById("creator-status").textContent = "Creator Sovereign active.";
  }
  updateHudCounts();
}

for (let i = 0; i < 80; i++) {
  particles.push({
    x: Math.random() * WORLD_W,
    y: Math.random() * WORLD_H,
    vy: 0.25 + Math.random() * 0.65,
    vx: (Math.random() - 0.5) * 0.45,
    size: Math.random() > 0.72 ? 2 : 1,
  });
}

function screenToWorld(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round((e.clientX - rect.left - canvas.width / 2) / cam.zoom + cam.x),
    y: Math.round((e.clientY - rect.top - canvas.height / 2) / cam.zoom + cam.y),
  };
}

canvas.addEventListener("mousedown", (e) => {
  const { x: wx, y: wy } = screenToWorld(e);

  if (builderMode && net.user && net.user.is_admin) {
    const hit = props.find((p) => Math.hypot(p.x - wx, p.y - wy) < 24);
    if (hit) {
      selectedProp = hit;
      draggingProp = true;
    } else {
      const created = { type: builderPropType, x: wx, y: wy };
      props.push(created);
      selectedProp = created;
      draggingProp = true;
    }
    return;
  }

  const hitStone = soapstones.find((s) => Math.hypot(s.x - wx, s.y - wy) < 18);
  if (hitStone) {
    activeSoapstone = hitStone;
    document.getElementById("reader-text").textContent = `"${hitStone.template_text}"`;
    document.getElementById("reader-meta").textContent =
      `Inscribed by ${hitStone.author_name} • ${hitStone.appraisals} Appraisals`;
    document.getElementById("soapstone-reader").classList.remove("hidden");
    return;
  }

  if (net.user) {
    targetWaypoint = {
      x: Math.max(260, Math.min(940, wx)),
      y: Math.max(230, Math.min(640, wy)),
    };
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!builderMode || !draggingProp || !selectedProp || !net.user || !net.user.is_admin) return;
  const { x: wx, y: wy } = screenToWorld(e);
  selectedProp.x = wx;
  selectedProp.y = wy;
});

window.addEventListener("mouseup", () => {
  draggingProp = false;
});

window.addEventListener("keydown", (e) => {
  if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === "h") {
    document.querySelectorAll(".hud-element").forEach((el) => el.classList.toggle("hidden"));
  } else if (k === "b") {
    if (!net.user || !net.user.is_admin) return;
    builderMode = !builderMode;
    selectedProp = null;
    draggingProp = false;
    showBanner(builderMode ? "MAP BUILDER: ON [B]" : "MAP BUILDER: OFF");
  } else if (builderMode && e.key === "Tab") {
    e.preventDefault();
    const idx = BUILDER_TYPES.indexOf(builderPropType);
    builderPropType = BUILDER_TYPES[(idx + 1) % BUILDER_TYPES.length];
  } else if (builderMode && (e.key === "Delete" || e.key === "Backspace") && selectedProp) {
    const idx = props.indexOf(selectedProp);
    if (idx !== -1) props.splice(idx, 1);
    selectedProp = null;
  } else if (builderMode && k === "c") {
    const formatted =
      "const props = [\n" +
      props.map((p) => `  { type: "${p.type}", x: ${Math.round(p.x)}, y: ${Math.round(p.y)} },`).join("\n") +
      "\n];";
    navigator.clipboard.writeText(formatted);
    showBanner("COPIED PROPS TO CLIPBOARD!");
  }
});
window.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function update() {
  tick++;

  if (net.user) {
    let dx = 0;
    let dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      targetWaypoint = null;
      const len = Math.hypot(dx, dy);
      net.user.x = Math.max(260, Math.min(940, net.user.x + (dx / len) * 2.2));
      net.user.y = Math.max(230, Math.min(640, net.user.y + (dy / len) * 2.2));
      net.user.moving = true;
    } else if (targetWaypoint) {
      const dist = Math.hypot(targetWaypoint.x - net.user.x, targetWaypoint.y - net.user.y);
      if (dist > 3) {
        net.user.x += ((targetWaypoint.x - net.user.x) / dist) * 2.2;
        net.user.y += ((targetWaypoint.y - net.user.y) / dist) * 2.2;
        net.user.moving = true;
      } else {
        targetWaypoint = null;
        net.user.moving = false;
      }
    } else {
      net.user.moving = false;
    }

    if (net.user.moving && tick - lastMoveSent > 6) {
      lastMoveSent = tick;
      net.send({ type: "move", x: Math.round(net.user.x), y: Math.round(net.user.y) });
    }

    if (tick % 300 === 0 && Math.hypot(net.user.x - GRACE.x, net.user.y - GRACE.y) < 75) {
      net.send({ type: "earn_souls" });
    }
  }

  players.forEach((p) => {
    const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
    if (dist > 1) {
      p.x += (p.targetX - p.x) * 0.15;
      p.y += (p.targetY - p.y) * 0.15;
      p.moving = true;
    } else {
      p.moving = false;
    }
  });

  npcs.forEach((n) => {
    if (n.wait > 0) {
      n.wait--;
      n.moving = false;
      return;
    }
    const dist = Math.hypot(n.tx - n.x, n.ty - n.y);
    if (dist > 3) {
      n.x += ((n.tx - n.x) / dist) * 0.85;
      n.y += ((n.ty - n.y) / dist) * 0.85;
      n.moving = true;
    } else {
      n.wait = 90 + Math.floor(Math.random() * 180);
      n.tx = 320 + Math.random() * 560;
      n.ty = 260 + Math.random() * 320;
    }
  });

  if (reelDirector) {
    directorTimer++;
    const roster = [...npcs, ...players.values(), ...(net.user ? [net.user] : [])];
    if (roster.length > 0) {
      if (directorTimer > 220) {
        directorTimer = 0;
        directorIndex = (directorIndex + 1) % roster.length;
      }
      const focus = roster[directorIndex % roster.length];
      cam.x += (focus.x - cam.x) * 0.04;
      cam.y += (focus.y - cam.y) * 0.04;
      cam.zoom += (1.9 - cam.zoom) * 0.04;
    }
  } else if (net.user) {
    cam.x += (net.user.x - cam.x) * 0.08;
    cam.y += (net.user.y - cam.y) * 0.08;
    cam.zoom += (1.65 - cam.zoom) * 0.08;
  } else {
    cam.x += (GRACE.x - cam.x) * 0.05;
    cam.y += (GRACE.y - cam.y) * 0.05;
    cam.zoom += (1.45 - cam.zoom) * 0.05;
  }
}

function drawGround() {
  // Deep mossy earth outer terrain
  if (customWorlds[atmosphere]) {
    ctx.drawImage(customWorlds[atmosphere], 0, 0, WORLD_W, WORLD_H);
    if (targetWaypoint) {
      ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(targetWaypoint.x, targetWaypoint.y, 10, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }
  ctx.fillStyle = atmosphere === "eclipse" ? "#140b10" : "#111412";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  // Outer grass & ash speckles
  groundDetails.forEach((d) => {
    ctx.fillStyle =
      d.tone === 0 ? "#19211b" : d.tone === 1 ? "#1e1c24" : d.tone === 2 ? "#252b23" : "#161918";
    ctx.fillRect(d.x, d.y, d.w, d.h);
  });

  // Cross-shaped stone courtyard & central plaza (instead of a rigid box)
  ctx.fillStyle = "#1d1b24";
  ctx.fillRect(340, 340, 520, 170); // East-West promenade
  ctx.fillRect(490, 235, 220, 385); // North-South chapel approach
  ctx.fillRect(430, 305, 340, 240); // Central Grace square

  // Varied cobblestone bricks
  for (let gx = 348; gx < 850; gx += 16) {
    for (let gy = 242; gy < 610; gy += 12) {
      const inPlaza =
        (gx >= 348 && gx <= 845 && gy >= 346 && gy <= 500) ||
        (gx >= 496 && gx <= 696 && gy >= 242 && gy <= 608) ||
        (gx >= 436 && gx <= 758 && gy >= 312 && gy <= 534);
      if (!inPlaza) continue;
      const offset = (gy / 12) % 2 === 0 ? 0 : 7;
      const hash = (gx * 13 + gy * 7) % 5;
      if (hash === 0) continue; // Natural worn gaps
      ctx.fillStyle = hash === 1 ? "#2b2836" : hash === 2 ? "#24212e" : "#312d3d";
      ctx.fillRect(gx + offset, gy, 12, 8);
    }
  }

  // Click waypoint ring
  if (targetWaypoint) {
    ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(targetWaypoint.x, targetWaypoint.y, 10, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawAtmosphere() {
  particles.forEach((p) => {
    p.y += atmosphere === "erdtree" ? -p.vy : p.vy;
    p.x += p.vx;
    if (p.y > WORLD_H) p.y = 0;
    if (p.y < 0) p.y = WORLD_H;

    ctx.fillStyle =
      atmosphere === "eclipse"
        ? "rgba(225, 45, 65, 0.6)"
        : atmosphere === "erdtree"
        ? "rgba(255, 215, 90, 0.72)"
        : "rgba(220, 215, 230, 0.38)";
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  drawGround();
  soapstones.forEach((s) => drawSoapstone(ctx, s, tick));

  const renderList = [
    { y: GRACE.y, draw: () => drawSiteOfGrace(ctx, GRACE.x, GRACE.y, tick) },
    ...props.map((p) => ({ y: p.y, draw: () => drawProp(ctx, p) })),
    ...npcs.map((n) => ({ y: n.y, draw: () => drawVillager(ctx, n, tick, false) })),
    ...[...players.values()].map((p) => ({ y: p.y, draw: () => drawVillager(ctx, p, tick, false) })),
    ...(net.user ? [{ y: net.user.y, draw: () => drawVillager(ctx, net.user, tick, true) }] : []),
  ];

  renderList.sort((a, b) => a.y - b.y);
  renderList.forEach((item) => item.draw());

  if (builderMode) {
    props.forEach((p) => {
      const isSel = p === selectedProp;
      ctx.fillStyle = isSel ? "#00ffcc" : "#ffd966";
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.font = "9px Silkscreen, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${p.type} (${p.x}, ${p.y})`, p.x, p.y + 12);
    });
  }

  drawAtmosphere();
  ctx.restore();

  // Atmospheric dark vignette around viewport edges
  const vig = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.25,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) * 0.72
  );
  vig.addColorStop(0, "rgba(0, 0, 0, 0)");
  vig.addColorStop(1, "rgba(4, 3, 7, 0.62)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (builderMode) {
    ctx.fillStyle = "rgba(10, 9, 14, 0.88)";
    ctx.fillRect(14, canvas.height - 34, 520, 22);
    ctx.strokeStyle = "#d4af37";
    ctx.strokeRect(14, canvas.height - 34, 520, 22);
    ctx.fillStyle = "#ffd966";
    ctx.font = "10px Silkscreen, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `BUILDER [${builderPropType.toUpperCase()}] | Click: Place/Drag | Tab: Cycle | Del: Remove | C: Copy`,
      22,
      canvas.height - 19
    );
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// UI Bindings
let authMode = "signup";
document.getElementById("tab-signup").onclick = () => {
  authMode = "signup";
  document.getElementById("tab-signup").classList.add("active");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("class-picker-wrap").classList.remove("hidden");
};
document.getElementById("tab-login").onclick = () => {
  authMode = "login";
  document.getElementById("tab-login").classList.add("active");
  document.getElementById("tab-signup").classList.remove("active");
  document.getElementById("class-picker-wrap").classList.add("hidden");
};

document.getElementById("btn-auth-open").onclick = () =>
  document.getElementById("auth-modal").classList.remove("hidden");

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.onclick = () => document.getElementById(btn.dataset.close).classList.add("hidden");
});

document.getElementById("btn-auth-submit").onclick = async () => {
  const err = document.getElementById("auth-error");
  err.textContent = "";
  try {
    const user = await net.auth(
      authMode,
      document.getElementById("auth-username").value,
      document.getElementById("auth-password").value,
      document.getElementById("auth-class").value
    );
    document.getElementById("auth-modal").classList.add("hidden");
    applyUserSession(user);
  } catch (e) {
    err.textContent = e.message;
  }
};

document.getElementById("btn-logout").onclick = () => {
  net.logout();
  location.reload();
};

document.getElementById("btn-unlock-creator").onclick = async () => {
  try {
    const user = await net.unlockCreator(document.getElementById("creator-passcode").value);
    applyUserSession(user);
  } catch (e) {
    document.getElementById("creator-status").textContent = e.message;
  }
};

document.getElementById("btn-creator-drawer").onclick = () =>
  document.getElementById("creator-drawer").classList.toggle("hidden");

document.getElementById("btn-batch-summon").onclick = async () => {
  const box = document.getElementById("batch-input");
  if (!box.value.trim()) return;
  await net.summonBatch(box.value);
  box.value = "";
};

document.querySelectorAll("[data-event]").forEach((btn) => {
  btn.onclick = () => net.send({ type: "admin_event", event: btn.dataset.event });
});

document.getElementById("btn-banner-send").onclick = () => {
  const text = document.getElementById("banner-input").value.trim() || "HUMANITY RESTORED";
  net.send({ type: "admin_event", event: atmosphere, banner: text });
};

function sendChat() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || !net.user) return;
  net.user.chatText = text;
  net.user.chatTimer = 260;
  net.send({ type: "chat", text });
  input.value = "";
}
document.getElementById("btn-chat-send").onclick = sendChat;
document.getElementById("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});

document.querySelectorAll("[data-gesture]").forEach((btn) => {
  btn.onclick = () => {
    if (!net.user) return;
    const g = btn.dataset.gesture;
    net.user.gesture = g;
    net.user.gestureTimer = 140;
    net.send({ type: "gesture", gesture: g });
    if (g === "Rest") net.send({ type: "earn_souls" });
  };
});

document.getElementById("btn-soapstone-open").onclick = () =>
  document.getElementById("soapstone-modal").classList.remove("hidden");

document.getElementById("btn-soapstone-place").onclick = async () => {
  if (!net.user || net.user.souls < 10) return;
  const text = document.getElementById("soapstone-template").value;
  const res = await net.placeSoapstone(text, Math.round(net.user.x), Math.round(net.user.y));
  if (res.user) {
    document.getElementById("souls-pill").textContent = `🔥 ${res.user.souls} Souls`;
  }
  document.getElementById("soapstone-modal").classList.add("hidden");
};

document.getElementById("btn-appraise").onclick = async () => {
  if (!activeSoapstone) return;
  await net.appraiseSoapstone(activeSoapstone.id);
  document.getElementById("soapstone-reader").classList.add("hidden");
};

document.getElementById("btn-reel-frame").onclick = (e) => {
  shell.classList.toggle("reel-mode");
  document.getElementById("reel-header").classList.toggle("hidden");
  e.target.classList.toggle("active");
  resize();
};

document.getElementById("btn-reel-cam").onclick = (e) => {
  reelDirector = !reelDirector;
  e.target.classList.toggle("active");
};

document.getElementById("btn-hide-ui").onclick = () => {
  document.querySelectorAll(".hud-element").forEach((el) => el.classList.toggle("hidden"));
};

(async function boot() {
  preloadCustomAssets();
  try {
    const world = await net.fetchWorld();
    npcs = world.npcs.map((n) => ({ ...n, tx: n.x, ty: n.y, wait: 40 }));
    soapstones = world.soapstones;
    world.online_players.forEach((p) => players.set(p.username, { ...p, targetX: p.x, targetY: p.y }));
    renderNpcList();
    updateHudCounts();
  } catch (err) {
    console.error("Failed to connect to Ashen Refuge backend:", err);
  }

  net.connectWS();
  const savedUser = await net.tryAutoLogin();
  if (savedUser) applyUserSession(savedUser);
  loop();
})();
