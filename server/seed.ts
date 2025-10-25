import { db } from "./db";
import { games } from "@shared/schema";

const sampleGames = [
  {
    title: "Cyber Legends",
    description: "An epic cyberpunk adventure in a neon-lit metropolis. Battle through intense action sequences, make critical choices, and uncover the truth behind a massive conspiracy. Features stunning visuals, deep storyline, and cutting-edge gameplay mechanics.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/cyber-legends",
    category: "Action RPG",
    tags: ["Singleplayer", "Story Rich", "Cyberpunk", "Open World"],
    featured: true,
  },
  {
    title: "Fantasy Realms: Shadow Kingdom",
    description: "Embark on a magical journey through mystical lands filled with danger and wonder. Command powerful spells, forge alliances, and battle ancient evils in this immersive fantasy RPG experience.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/fantasy-realms",
    category: "Fantasy RPG",
    tags: ["Multiplayer", "Magic", "Medieval", "Co-op"],
    featured: false,
  },
  {
    title: "Velocity Racers",
    description: "Experience the thrill of high-speed racing on futuristic tracks. Customize your hovercrafts, compete in global tournaments, and master gravity-defying stunts in this adrenaline-pumping racing game.",
    imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/velocity-racers",
    category: "Racing",
    tags: ["Multiplayer", "Fast-Paced", "Competitive", "Customization"],
    featured: false,
  },
  {
    title: "Survival Instinct",
    description: "Fight to survive in a post-apocalyptic wasteland. Scavenge for resources, build shelters, and defend against hostile threats in this intense survival simulation with realistic mechanics.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/survival-instinct",
    category: "Survival",
    tags: ["Singleplayer", "Crafting", "Base Building", "Horror"],
    featured: false,
  },
  {
    title: "Tactical Command",
    description: "Lead your forces to victory in this deep strategy game. Plan your moves carefully, manage resources wisely, and outsmart your opponents in epic tactical battles across diverse terrains.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/tactical-command",
    category: "Strategy",
    tags: ["Turn-Based", "Strategy", "Tactical", "Singleplayer"],
    featured: false,
  },
  {
    title: "Space Odyssey",
    description: "Explore the vast cosmos in this space exploration game. Discover new planets, encounter alien civilizations, and unravel the mysteries of the universe in your interstellar journey.",
    imageUrl: "https://images.unsplash.com/photo-1614732484003-ef9881555dc3?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/space-odyssey",
    category: "Space Exploration",
    tags: ["Exploration", "Sci-Fi", "Open World", "Story Rich"],
    featured: false,
  },
  {
    title: "Dungeon Crawler Elite",
    description: "Delve deep into procedurally generated dungeons filled with treasures and terrors. Master various character classes, collect legendary loot, and face off against powerful bosses.",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/dungeon-crawler",
    category: "Roguelike",
    tags: ["Procedural", "Loot", "RPG", "Challenging"],
    featured: false,
  },
  {
    title: "Neon Strike",
    description: "Fast-paced first-person shooter set in a cyberpunk future. Engage in intense firefights, use advanced weaponry, and compete in multiplayer modes with players worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=460&h=215&fit=crop",
    downloadUrl: "https://example.com/download/neon-strike",
    category: "FPS",
    tags: ["Multiplayer", "Shooter", "Competitive", "Fast-Paced"],
    featured: false,
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
