import ApiError from "../../errors/ApiError.js";
import { prisma } from "../../lib/prisma.js";

const getDashboardStats = async () => {
  const [totalTutors, totalStudents, totalBookings] = await Promise.all([
    prisma.tutorProfile.count(),
    prisma.studentProfile.count(),
    prisma.booking.count(),
  ]);

  return {
    totalTutors,
    totalStudents,
    totalBookings,
  };
};

const updateUserBanStatus = async (userId: string, banned: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (user.role === "admin") {
    throw new ApiError(400, "Administrators cannot be banned.");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { banned },
    select: { id: true, email: true, role: true, banned: true },
  });
};

const createCategory = async (name: string) => {
  const normalizedName = name.trim();

  const existingCategory = await prisma.category.findUnique({
    where: { name: normalizedName },
  });

  if (existingCategory) {
    throw new ApiError(400, "Category with this name already exists.");
  }

  return await prisma.category.create({
    data: { name: normalizedName },
  });
};

const deleteCategory = async (id: string) => {
  // Check if the category exists
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return await prisma.category.delete({
    where: { id },
  });
};

const updateTutorFeaturedStatus = async (
  tutorProfileId: string,
  isFeatured: boolean,
) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorProfileId },
  });

  if (!tutor) {
    throw new ApiError(404, "Tutor profile not found.");
  }

  return await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: { isFeatured },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const adminService = {
  getDashboardStats,
  updateUserBanStatus,
  createCategory,
  deleteCategory,
  updateTutorFeaturedStatus,
};
