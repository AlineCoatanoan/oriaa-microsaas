import prisma from "../../src/lib/prisma.js";

export async function seedRoles() {
  const adminRole = await prisma.role.create({
    data: {
      label: "admin",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      label: "user",
    },
  });

  return {
    adminRole,
    userRole,
  };
}