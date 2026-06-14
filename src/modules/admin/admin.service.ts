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

export const adminService = {
  getDashboardStats,
  updateUserBanStatus,
};
