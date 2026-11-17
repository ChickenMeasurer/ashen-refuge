export const customSprites = {};
export const customWorlds = {};

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

export function preloadCustomAssets() {
  Object.entries(CLASS_FILES).forEach(([className, file]) => {
    const img = new Image();
    img.src = `./assets/classes/${file}`;
    img.onload = () => {
      customSprites[className] = img;
    };
  });

  Object.entries(WORLD_FILES).forEach(([themeKey, file]) => {
    const img = new Image();
    img.src = `./assets/worlds/${file}`;
    img.onload = () => {
      customWorlds[themeKey] = img;
    };
  });
}