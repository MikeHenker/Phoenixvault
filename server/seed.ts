import { db } from "./db";
import { games } from "@shared/schema";

const sampleGames = [
  {
    title: "Cyber Legends",
    description: "An epic cyberpunk adventure in a neon-lit metropolis. Battle through intense action sequences, make critical choices, and uncover the truth behind a massive conspiracy. Features stunning visuals, deep storyline, and cutting-edge gameplay mechanics.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/cyber-legends",
    category: "Action RPG",
    tags: ["Singleplayer", "Story Rich", "Cyberpunk", "Open World"],
    featured: true,
    isActive: true,
  },
  {
    title: "Fantasy Realms: Shadow Kingdom",
    description: "Embark on a magical journey through mystical lands filled with danger and wonder. Command powerful spells, forge alliances, and battle ancient evils in this immersive fantasy RPG experience.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/fantasy-realms",
    category: "Fantasy RPG",
    tags: ["Multiplayer", "Magic", "Medieval", "Co-op"],
    featured: false,
    isActive: true,
  },
  {
    title: "Velocity Racers",
    description: "Experience the thrill of high-speed racing on futuristic tracks. Customize your hovercrafts, compete in global tournaments, and master gravity-defying stunts in this adrenaline-pumping racing game.",
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/velocity-racers",
    category: "Racing",
    tags: ["Multiplayer", "Fast-Paced", "Competitive", "Customization"],
    featured: false,
    isActive: true,
  },
  {
    title: "Survival Instinct",
    description: "Fight to survive in a post-apocalyptic wasteland. Scavenge for resources, build shelters, and defend against hostile threats in this intense survival simulation with realistic mechanics.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/survival-instinct",
    category: "Survival",
    tags: ["Singleplayer", "Crafting", "Base Building", "Horror"],
    featured: false,
    isActive: true,
  },
  {
    title: "Tactical Command",
    description: "Lead your forces to victory in this deep strategy game. Plan your moves carefully, manage resources wisely, and outsmart your opponents in epic tactical battles across diverse terrains.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/tactical-command",
    category: "Strategy",
    tags: ["Turn-Based", "Strategy", "Tactical", "Singleplayer"],
    featured: false,
    isActive: true,
  },
  {
    title: "Space Odyssey",
    description: "Explore the vast cosmos in this space exploration game. Discover new planets, encounter alien civilizations, and unravel the mysteries of the universe in your interstellar journey.",
    imageUrl: "https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/space-odyssey",
    category: "Space Exploration",
    tags: ["Exploration", "Sci-Fi", "Open World", "Story Rich"],
    featured: false,
    isActive: true,
  },
  {
    title: "Dungeon Crawler Elite",
    description: "Delve deep into procedurally generated dungeons filled with treasures and terrors. Master various character classes, collect legendary loot, and face off against powerful bosses.",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/dungeon-crawler",
    category: "Roguelike",
    tags: ["Procedural", "Loot", "RPG", "Challenging"],
    featured: false,
    isActive: true,
  },
  {
    title: "Neon Strike",
    description: "Fast-paced first-person shooter set in a cyberpunk future. Engage in intense firefights, use advanced weaponry, and compete in multiplayer modes with players worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/neon-strike",
    category: "FPS",
    tags: ["Multiplayer", "Shooter", "Competitive", "Fast-Paced"],
    featured: false,
    isActive: true,
  },
  {
    title: "Medieval Quest",
    description: "Become a legendary knight in this action-packed medieval adventure. Battle fierce enemies, explore ancient castles, and uncover the secrets of the old kingdoms. Features epic boss battles and deep character customization.",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/medieval-quest",
    category: "Action Adventure",
    tags: ["Singleplayer", "Medieval", "Action", "RPG Elements"],
    featured: false,
    isActive: true,
  },
  {
    title: "Quantum Shift",
    description: "Manipulate time and space in this mind-bending puzzle platformer. Solve intricate puzzles using quantum mechanics, navigate through parallel dimensions, and uncover the truth about reality itself.",
    imageUrl: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/quantum-shift",
    category: "Puzzle Platformer",
    tags: ["Puzzle", "Platformer", "Sci-Fi", "Mind-Bending"],
    featured: false,
    isActive: true,
  },
  {
    title: "Ocean Deep",
    description: "Dive into the mysterious depths of the ocean in this underwater exploration game. Discover lost civilizations, encounter exotic marine life, and uncover ancient treasures hidden beneath the waves.",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop",
    downloadUrl: "https://example.com/download/ocean-deep",
    category: "Exploration",
    tags: ["Exploration", "Underwater", "Adventure", "Discovery"],
    featured: false,
    isActive: true,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Check if games already exist
    const existingGames = await db.select().from(games);
    
    if (existingGames.length > 0) {
      console.log("✅ Database already seeded with", existingGames.length, "games");
      return;
    }

    // Insert sample games
    await db.insert(games).values(sampleGames);
    
    console.log("✅ Successfully seeded database with", sampleGames.length, "games");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
