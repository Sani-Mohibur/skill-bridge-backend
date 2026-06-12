import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Categories
  const categories = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "English",
  ];
  console.log("Creating default categories...");
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Seed Default Admin User
  console.log("Creating default admin account...");
  await prisma.user.upsert({
    where: { email: "admin@skillbridge.com" },
    update: {},
    create: {
      id: "admin-root-id", // Explicit string ID matching Better Auth standards
      name: "Platform Admin",
      email: "admin@skillbridge.com",
      emailVerified: true,
      role: "admin",
      // Note: In production, Better Auth handles hashed values. For manual seed testing:
      banned: false,
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// npx prisma db seed
