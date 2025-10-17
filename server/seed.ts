import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    const existingAdmin = await db.select().from(users).where(eq(users.username, "Kareem"));
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("karee21", 10);
      
      await db.insert(users).values({
        username: "Kareem",
        email: "kareem@phoenixgames.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin user created:");
      console.log("   Username: Kareem");
      console.log("   Password: karee21");
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
