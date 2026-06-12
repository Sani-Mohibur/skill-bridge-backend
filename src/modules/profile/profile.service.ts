import { prisma } from "../../lib/prisma.js";

// Student Interfaces
interface UpdateStudentData {
  phone?: string;
  address?: string;
  bio?: string;
}

// Tutor Interfaces
interface UpdateTutorData {
  title?: string;
  bio?: string;
  qualifications?: string;
  pricePerHour?: number;
  categoryId?: string;
}

const getStudent = async (userId: string) => {
  return await prisma.studentProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
};

const updateStudent = async (userId: string, payload: UpdateStudentData) => {
  return await prisma.studentProfile.update({
    where: { userId },
    data: payload,
  });
};

const getTutor = async (userId: string) => {
  return await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true, role: true } },
      category: { select: { name: true } },
    },
  });
};

const updateTutor = async (userId: string, payload: UpdateTutorData) => {
  return await prisma.tutorProfile.update({
    where: { userId },
    data: payload,
  });
};

export const profileService = {
  getStudent,
  updateStudent,
  getTutor,
  updateTutor,
};
