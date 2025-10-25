import { db } from "./db";
import { licenses } from "@shared/schema";

const sampleLicenses = [
  { key: "BETA-2024-ALPHA-001", isActive: true },
  { key: "BETA-2024-ALPHA-002", isActive: true },
  { key: "BETA-2024-ALPHA-003", isActive: true },
  { key: "BETA-2024-GAMMA-004", isActive: true },
  { key: "BETA-2024-DELTA-005", isActive: true },
];

async function seedLicenses() {
  console.log("🔑 Seeding licenses...");

  try {
    const existingLicenses = await db.select().from(licenses);
    
    if (existingLicenses.length > 0) {
      console.log("✅ Database already has", existingLicenses.length, "licenses");
      return;
    }

    await db.insert(licenses).values(sampleLicenses);
    
    console.log("✅ Successfully seeded database with", sampleLicenses.length, "license keys");
    console.log("Available keys:");
    sampleLicenses.forEach(l => console.log("  -", l.key));
  } catch (error) {
    console.error("❌ Error seeding licenses:", error);
  }
}

seedLicenses();
