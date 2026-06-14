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

  // 2. Seed Admin account via signup API
  const adminEmail = "farabisunny5@gmail.com";
  console.log("Checking if admin account exists...");

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    console.log("Registering admin account via API endpoint...");
    const adminData = {
      name: "Farabi Sunny",
      email: adminEmail,
      password: "farabi1234",
    };

    const response = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Auth API registration failed: ${errText}`);
    }

    console.log("Elevating user privileges to Admin role...");
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "admin",
        emailVerified: true,
      },
    });
  } else {
    console.log(
      "Admin user account already exists. Elevating permissions just in case...",
    );
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });
  }

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
