import { customSprites, customProps } from "./assets_loader.js";

const CLASS_PALETTES = {
  Knight: { body: "#8c99a8", trim: "#e0b841", cloak: "#7a1c28", helm: "#aebac9" },
  Sorcerer: { body: "#263f78", trim: "#59d0ff", cloak: "#19294d", helm: "#31539c" },
  "Warrior Jar": { body: "#c46d3b", trim: "#b82525", cloak: "#8f4a24", helm: "#d63131" },
  Maiden: { body: "#e6dfd1", trim: "#ffd65c", cloak: "#3f384a", helm: "#f2ece1" },
  Confessor: { body: "#23212b", trim: "#d4af37", cloak: "#15141a", helm: "#2e2b38" },
  Vagabond: { body: "#695645", trim: "#9bb0c4", cloak: "#45382c", helm: "#7c8b99" },
};

export function drawSiteOfGrace(ctx, x, y, tick) {
  ctx.fillStyle = "#1c1a24";
  ctx.fillRect(x - 24, y - 10, 48, 20);
  ctx.fillStyle = "#2f2b3b";
  ctx.fillRect(x - 20, y - 8, 40, 16);
  ctx.fillStyle = "#484259";
  ctx.fillRect(x - 14, y - 5, 28, 10);

  const pulse = 58 + Math.sin(tick * 0.07) * 8;
  const grad = ctx.createRadialGradient(x, y - 12, 2, x, y - 12, pulse);
  grad.addColorStop(0, "rgba(255, 210, 90, 0.52)");
  grad.addColorStop(0.5, "rgba(255, 145, 30, 0.16)");
  grad.addColorStop(1, "rgba(255, 120, 10, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y - 12, pulse, 0, Math.PI * 2);
  ctx.fill();

  const bob = Math.sin(tick * 0.1) * 2.5;
  ctx.fillStyle = "#ff8c1a";
  ctx.fillRect(x - 4, y - 20 + bob, 8, 13);
  ctx.fillStyle = "#ffd95e";
  ctx.fillRect(x - 3, y - 18 + bob, 6, 9);
  ctx.fillStyle = "#fffbe0";
  ctx.fillRect(x - 1, y - 15 + bob, 2, 5);

  for (let i = 0; i < 9; i++) {
    const t = (tick * 0.55 + i * 13) % 44;
    const ex = x + Math.sin(tick * 0.05 + i * 1.7) * (6 + t * 0.25);
    const ey = y - 14 - t;
    ctx.fillStyle = t < 22 ? "#ffe885" : "rgba(255, 160, 45, 0.45)";
    ctx.fillRect(Math.round(ex), Math.round(ey), 2, 2);
  }
}

export function drawProp(ctx, prop) {
  const { type, x, y } = prop;

  if (customProps[type]) {
    const img = customProps[type];
    ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height));
    return;
  }

  if (type === "chapel") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x - 54, y - 6, 108, 12);
    ctx.fillStyle = "#221f2b";
    ctx.fillRect(x - 48, y - 82, 96, 82);
    ctx.fillStyle = "#2e2a3a";
    ctx.fillRect(x - 44, y - 78, 88, 74);
    ctx.fillStyle = "#191721";
    ctx.beginPath();
    ctx.moveTo(x - 54, y - 78);
    ctx.lineTo(x, y - 118);
    ctx.lineTo(x + 54, y - 78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(x - 9, y - 66, 18, 18);
    ctx.fillStyle = "#ff9d3b";
    ctx.fillRect(x - 7, y - 64, 14, 14);
    ctx.fillStyle = "#221f2b";
    ctx.fillRect(x - 1, y - 66, 2, 18);
    ctx.fillRect(x - 9, y - 58, 18, 2);
    ctx.fillStyle = "#0e0c12";
    ctx.fillRect(x - 12, y - 34, 24, 34);
    ctx.fillStyle = "#3f3a4f";
    ctx.fillRect(x - 14, y - 36, 28, 3);
  } else if (type === "arch") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - 32, y - 3, 64, 7);
    ctx.fillStyle = "#23202c";
    ctx.fillRect(x - 28, y - 62, 12, 62);
    ctx.fillRect(x + 16, y - 62, 12, 62);
    ctx.fillStyle = "#343040";
    ctx.fillRect(x - 33, y - 72, 66, 13);
    ctx.fillStyle = "#484257";
    ctx.fillRect(x - 31, y - 72, 62, 3);
    ctx.fillStyle = "#273b2c";
    ctx.fillRect(x - 26, y - 58, 6, 14);
    ctx.fillRect(x + 18, y - 32, 8, 18);
  } else if (type === "tree") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - 14, y - 3, 28, 6);
    ctx.fillStyle = "#241d21";
    ctx.fillRect(x - 5, y - 48, 10, 48);
    ctx.fillStyle = "#30272c";
    ctx.fillRect(x - 3, y - 48, 4, 48);
    ctx.fillStyle = "#241d21";
    ctx.fillRect(x - 20, y - 38, 16, 5);
    ctx.fillRect(x - 24, y - 50, 5, 14);
    ctx.fillRect(x + 5, y - 42, 18, 5);
    ctx.fillRect(x + 19, y - 54, 5, 15);
    ctx.fillStyle = "#3a2729";
    ctx.fillRect(x - 28, y - 58, 18, 12);
    ctx.fillRect(x + 10, y - 62, 20, 13);
    ctx.fillRect(x - 12, y - 66, 24, 14);
    ctx.fillStyle = "#573735";
    ctx.fillRect(x - 8, y - 64, 16, 8);
  } else if (type === "lantern") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - 5, y - 2, 12, 4);
    ctx.fillStyle = "#2d2a36";
    ctx.fillRect(x - 2, y - 36, 4, 36);
    ctx.fillRect(x - 2, y - 36, 11, 3);
    ctx.fillStyle = "#ffca4b";
    ctx.fillRect(x + 5, y - 33, 6, 7);
    const g = ctx.createRadialGradient(x + 8, y - 29, 1, x + 8, y - 29, 38);
    g.addColorStop(0, "rgba(255, 195, 70, 0.36)");
    g.addColorStop(1, "rgba(255, 195, 70, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + 8, y - 29, 38, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "grave") {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - 8, y - 2, 16, 4);
    ctx.fillStyle = "#332f3d";
    ctx.fillRect(x - 6, y - 16, 12, 16);
    ctx.fillRect(x - 4, y - 19, 8, 3);
    ctx.fillStyle = "#484354";
    ctx.fillRect(x - 4, y - 14, 8, 2);
  }
}

export function drawSoapstone(ctx, stone, tick) {
  const glow = 0.65 + Math.sin(tick * 0.1 + stone.id) * 0.25;
  ctx.fillStyle = `rgba(255, 110, 25, ${glow * 0.35})`;
  ctx.fillRect(stone.x - 10, stone.y - 5, 20, 10);
  ctx.fillStyle = `rgba(255, 130, 35, ${glow})`;
  ctx.fillRect(stone.x - 7, stone.y - 3, 14, 6);
  ctx.fillStyle = `rgba(255, 225, 140, ${glow})`;
  ctx.fillRect(stone.x - 4, stone.y - 1, 8, 2);
}

export function drawVillager(ctx, entity, tick, isSelf = false) {
  const pal = CLASS_PALETTES[entity.player_class] || CLASS_PALETTES.Knight;
  const x = Math.round(entity.x);
  const y = Math.round(entity.y);
  const moving = entity.moving;
  const step = moving ? Math.sin(tick * 0.26) * 2.5 : 0;
  const bob = moving ? Math.abs(Math.sin(tick * 0.26)) * -2 : Math.sin(tick * 0.06) * 0.8;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.fillRect(x - 9, y - 2, 18, 5);

  // Summon beam effect
  if (entity.summonTimer > 0) {
    const alpha = entity.summonTimer / 90;
    ctx.fillStyle = `rgba(255, 215, 90, ${alpha * 0.48})`;
    ctx.fillRect(x - 11, y - 86, 22, 86);
    entity.summonTimer--;
  }

  const sheet = customSprites[entity.player_class];
  if (sheet) {
    const isSheet = sheet.width >= sheet.height * 2;
    const frameW = isSheet ? sheet.width / 2 : sheet.width;
    const frameIdx = entity.moving && Math.floor(tick / 10) % 2 === 1 && isSheet ? 1 : 0;
    ctx.drawImage(
      sheet,
      frameIdx * frameW,
      0,
      frameW,
      sheet.height,
      x - 16,
      y - 32 + bob,
      32,
      32
    );
  } else if (entity.player_class === "Warrior Jar") {
    ctx.fillStyle = "#3b2c25";
    ctx.fillRect(x - 6, y - 5 + step * 0.4, 4, 5);
    ctx.fillRect(x + 2, y - 5 - step * 0.4, 4, 5);
    ctx.fillStyle = pal.body;
    ctx.fillRect(x - 9, y - 21 + bob, 18, 16);
    ctx.fillStyle = "#db824d";
    ctx.fillRect(x - 7, y - 19 + bob, 6, 12);
    ctx.fillStyle = pal.helm;
    ctx.fillRect(x - 8, y - 26 + bob, 16, 5);
    ctx.fillStyle = pal.cloak;
    ctx.fillRect(x - 12, y - 16 + bob - step * 0.5, 3, 8);
    ctx.fillRect(x + 9, y - 16 + bob + step * 0.5, 3, 8);
  } else {
    ctx.fillStyle = "#191720";
    ctx.fillRect(x - 5, y - 6 + step * 0.5, 4, 6);
    ctx.fillRect(x + 1, y - 6 - step * 0.5, 4, 6);

    ctx.fillStyle = pal.cloak;
    ctx.fillRect(x - 7, y - 19 + bob, 14, 13);
    ctx.fillStyle = pal.body;
    ctx.fillRect(x - 5, y - 19 + bob, 10, 11);
    ctx.fillStyle = pal.trim;
    ctx.fillRect(x - 5, y - 12 + bob, 10, 2);

    ctx.fillStyle = pal.helm;
    ctx.fillRect(x - 5, y - 28 + bob, 10, 9);

    if (entity.player_class === "Knight") {
      ctx.fillStyle = "#b82838";
      ctx.fillRect(x - 2, y - 32 + bob, 5, 4);
      ctx.fillStyle = "#cfd8e3";
      ctx.fillRect(x + 7, y - 24 + bob, 2, 16);
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(x + 5, y - 12 + bob, 6, 2);
    } else if (entity.player_class === "Sorcerer") {
      ctx.fillStyle = pal.helm;
      ctx.fillRect(x - 9, y - 29 + bob, 18, 3);
      ctx.fillRect(x - 6, y - 34 + bob, 12, 5);
      ctx.fillRect(x - 3, y - 38 + bob, 6, 4);
      ctx.fillStyle = "#6e4e32";
      ctx.fillRect(x + 7, y - 25 + bob, 2, 22);
      ctx.fillStyle = "#59d0ff";
      ctx.fillRect(x + 6, y - 28 + bob, 4, 4);
    } else if (entity.player_class === "Maiden") {
      ctx.fillStyle = "#fff9eb";
      ctx.fillRect(x - 6, y - 29 + bob, 12, 3);
      ctx.fillStyle = "#ffd966";
      ctx.fillRect(x + 7, y - 14 + bob, 4, 5);
    } else if (entity.player_class === "Confessor") {
      ctx.fillStyle = "#15141a";
      ctx.fillRect(x - 6, y - 30 + bob, 12, 4);
    }

    ctx.fillStyle = "#121017";
    ctx.fillRect(x - 3, y - 24 + bob, 6, 2);
  }

  // Gesture icon
  if (entity.gestureTimer > 0) {
    entity.gestureTimer--;
    ctx.font = "11px Silkscreen, monospace";
    ctx.textAlign = "center";
    const icons = { Praise: "\\[T]/", Rest: "🔥", Wave: "👋" };
    ctx.fillStyle = "#ffd966";
    ctx.fillText(icons[entity.gesture] || "✨", x, y - 42 + bob);
  }

  // Floating Nametag
  ctx.font = "9px Silkscreen, monospace";
  ctx.textAlign = "center";
  const label = isSelf ? `♦ ${entity.username}` : entity.username;
  const textW = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(8, 7, 11, 0.78)";
  ctx.fillRect(x - textW / 2 - 3, y - 42, textW + 6, 11);
  ctx.fillStyle = isSelf ? "#ffd966" : "#e8e2d5";
  ctx.fillText(label, x, y - 34);

  // Speech bubble
  if (entity.chatText && entity.chatTimer > 0) {
    entity.chatTimer--;
    const bw = Math.min(185, ctx.measureText(entity.chatText).width + 12);
    ctx.fillStyle = "rgba(18, 16, 24, 0.95)";
    ctx.fillRect(x - bw / 2, y - 60, bw, 15);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - bw / 2, y - 60, bw, 15);
    ctx.fillStyle = "#fff6db";
    ctx.fillText(entity.chatText.slice(0, 28), x, y - 50);
  }
}