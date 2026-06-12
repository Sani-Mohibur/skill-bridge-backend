import { connect } from "node:http2";
import { prisma } from "../../lib/prisma.js";

interface CreateReviewData {
  studentUserId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

const add = async ({
  studentUserId,
  bookingId,
  rating,
  comment,
}: CreateReviewData) => {
  // 1. Get student profile ID
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
  });
  if (!student) throw new Error("Student profile missing.");

  // 2. Verify completed booking exists for this student
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studentProfileId: student.id, status: "completed" },
  });
  if (!booking) throw new Error("No completed booking found to review.");

  // 3. Save the review
  return await prisma.review.create({
    data: {
      studentProfileId: student.id,
      tutorProfileId: booking.tutorProfileId,
      bookingId,
      rating,
      comment: comment ?? null,
    },
  });
};

const getByTutor = async (tutorProfileId: string) => {
  return await prisma.review.findMany({
    where: { tutorProfileId },
    include: {
      studentProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getMyReviews = async (studentUserId: string) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
  });
  if (!student) throw new Error("Student profile missing.");

  return await prisma.review.findMany({
    where: { studentProfileId: student.id },
    include: {
      tutorProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewService = {
  add,
  getByTutor,
  getMyReviews,
};
