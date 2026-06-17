import { prisma } from "../../lib/prisma.js";

const bookSlotService = async (userId: string, availabilityId: string) => {
  // 1. Ensure the availability slot actually exists and is not already booked
  const slot = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });
  if (!slot) throw new Error("The requested tutor slot does not exist.");
  if (slot.isBooked)
    throw new Error("This session slot has already been claimed.");

  // 2. Fetch the student's internal profile ID
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!studentProfile)
    throw new Error("Student profile configuration missing.");

  // 3. Prevent duplicate bookings for the same student on this slot
  const existingBooking = await prisma.booking.findFirst({
    where: {
      studentProfileId: studentProfile.id,
      availabilityId,
    },
  });
  if (existingBooking) throw new Error("You have already joined this session.");

  // 4. Register the student and flip the isBooked flag inside a transaction
  return await prisma.$transaction(async (tx) => {
    await tx.availability.update({
      where: { id: availabilityId },
      data: { isBooked: true },
    });

    return await tx.booking.create({
      data: {
        studentProfileId: studentProfile.id,
        availabilityId,
        tutorProfileId: slot.tutorProfileId,
        status: "pending",
      },
    });
  });
};

const cancelBookingService = async (userId: string, bookingId: string) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!studentProfile)
    throw new Error("Student profile configuration missing.");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.studentProfileId !== studentProfile.id) {
    throw new Error("Booking record not found or access denied.");
  }
  if (booking.status === "completed") {
    throw new Error(
      "Cannot cancel a session that has already been marked complete.",
    );
  }

  return await prisma.booking.delete({ where: { id: bookingId } });
};

const completeBookingService = async (
  userId: string,
  availabilityId: string,
) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile configuration missing.");

  const slot = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });
  if (!slot || slot.tutorProfileId !== tutorProfile.id) {
    throw new Error("Slot validation failed or unauthorized access.");
  }

  // Prevent completing the group session before its actual calendar time
  if (new Date() < new Date(slot.slot)) {
    throw new Error(
      "Cannot mark a class complete before its scheduled date and time.",
    );
  }

  // Bulk update all student registrations assigned to this specific slot
  return await prisma.booking.updateMany({
    where: { availabilityId },
    data: { status: "completed" },
  });
};

const getStudentBookingsService = async (userId: string) => {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!studentProfile)
    throw new Error("Student profile configuration missing.");

  return await prisma.booking.findMany({
    where: { studentProfileId: studentProfile.id },
    include: {
      review: true,
      availability: {
        include: {
          tutorProfile: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getTutorBookingsService = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile configuration missing.");

  return await prisma.booking.findMany({
    where: { tutorProfileId: tutorProfile.id },
    include: {
      studentProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
      availability: { select: { slot: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSlotStudentsService = async (
  tutorUserId: string,
  availabilityId: string,
) => {
  // First find the tutor's profile id using their authenticated userId
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: tutorUserId },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found.");
  }

  return await prisma.booking.findMany({
    where: {
      availabilityId,
      tutorProfileId: tutorProfile.id, // Securely ensures the booking belongs to this tutor
    },
    include: {
      studentProfile: {
        select: {
          id: true,
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });
};

export const bookingService = {
  bookSlotService,
  cancelBookingService,
  completeBookingService,
  getStudentBookingsService,
  getTutorBookingsService,
  getSlotStudentsService,
};
