export const customSprites = {};
export const customWorlds = {};
export const customProps = {};
export const customParticles = {};

const CLASS_FILES = {
  Knight: "knight.png",
  Sorcerer: "sorcerer.png",
  "Warrior Jar": "warrior_jar.png",
  Maiden: "maiden.png",
  Confessor: "confessor.png",
  Vagabond: "vagabond.png",
};

const WORLD_FILES = {
  ash: "ash_chapel.png",
  erdtree: "erdtree_glade.png",
  eclipse: "blood_marsh.png",
};

const PROP_FILES = {
  chapel: "chapel.png",
  blacksmith: "blacksmith.png",
  tavern: "tavern.png",
  boogersorcerer: "sorcerer.png",
};

const PARTICLE_FILES = {
  ash: "ash.png",
  rain: "rain.png",
  snow: "snow.png",
  erdtree: "erdtree.png",
  eclipse: "eclipse.png",
};

function loadImage(src, onLoad) {
  const img = new Image();
  img.onload = () => onLoad(img);
  img.onerror = () => {}; // Silently fall back to procedural art if missing
  img.src = src;
}

export function preloadCustomAssets() {
  for (const [cls, file] of Object.entries(CLASS_FILES)) {
    loadImage(`./assets/classes/${file}`, (img) => {
      customSprites[cls] = img;
    });
  }
  for (const [atmo, file] of Object.entries(WORLD_FILES)) {
    loadImage(`./assets/worlds/${file}`, (img) => {
      customWorlds[atmo] = img;
    });
  }
  for (const [propName, file] of Object.entries(PROP_FILES)) {
    loadImage(`./assets/props/${file}`, (img) => {
      customProps[propName] = img;
    });
  }
  for (const [weatherName, file] of Object.entries(PARTICLE_FILES)) {
    loadImage(`./assets/particles/${file}`, (img) => {
      customParticles[weatherName] = img;
    });
  }
}