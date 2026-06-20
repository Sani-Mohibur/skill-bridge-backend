import ApiError from "../../errors/ApiError.js";
import { prisma } from "../../lib/prisma.js";
import { paginationHelper } from "../../utils/paginationHelper.js";

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

const getAllUsers = async (query: any) => {
  const paginationResult = paginationHelper.calculatePagination({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  const whereConditions: any = {};

  // 1. Search name or email
  if (query.search) {
    whereConditions.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // 2. Filter by explicit system role
  if (query.role && query.role !== "all") {
    whereConditions.role = query.role;
  }

  // 3. Filter by operational banned state
  if (query.banned && query.banned !== "all") {
    whereConditions.banned = query.banned === "true";
  }

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where: whereConditions }),
    prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
      },
      skip: paginationResult.skip,
      take: paginationResult.limit,
      orderBy: {
        [paginationResult.sortBy]: paginationResult.sortOrder,
      },
    }),
  ]);

  return {
    meta: {
      page: paginationResult.page,
      limit: paginationResult.limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / paginationResult.limit),
    },
    data: users,
  };
};

export const adminService = {
  getDashboardStats,
  updateUserBanStatus,
  createCategory,
  deleteCategory,
  updateTutorFeaturedStatus,
  getAllUsers,
};
