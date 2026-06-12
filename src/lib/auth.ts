import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { USER_ROLES } from "../constants/user.constants";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [process.env.CLIENT_URL!],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: USER_ROLES.STUDENT,
        required: true,
      },
      banned: {
        type: "boolean",
        defaultValue: false,
        required: true,
      },
    },
  },

  // automatic profile generation
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === USER_ROLES.STUDENT) {
            await prisma.studentProfile.create({
              data: { userId: user.id },
            });
          } else if (user.role === USER_ROLES.TUTOR) {
            await prisma.tutorProfile.create({
              data: { userId: user.id },
            });
          }
        },
      },
    },
  },
});
