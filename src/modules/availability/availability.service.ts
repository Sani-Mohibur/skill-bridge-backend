import { prisma } from "../../lib/prisma";

interface CreateSlotData {
  userId: string;
  slot: string; // ISO Date String from request body
  title?: string;
  subject?: string;
  details?: string;
  location?: string;
  timeDuration?: string;
  pricePerHour?: string;
}

const createAvailabilityService = async ({
  userId,
  slot,
  title,
  subject,
  details,
  location,
  timeDuration,
  pricePerHour,
}: CreateSlotData) => {
  // 1. Find the TutorProfile connected to the logged-in User ID
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found for this account.");
  }

  // 2. Insert the open availability slot record with new optional metadata
  const newSlot = await prisma.availability.create({
    data: {
      tutorProfileId: tutorProfile.id,
      slot: new Date(slot),
      isBooked: false,
      title,
      subject,
      details,
      location,
      timeDuration,
      pricePerHour,
    },
  });

  return newSlot;
};

const getAllAvailabilitiesService = async (tutorProfileId?: string) => {
  return await prisma.availability.findMany({
    where: {
      isBooked: false,
      ...(tutorProfileId ? { tutorProfileId } : {}),
    },
    include: {
      tutorProfile: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { slot: "asc" },
  });
};

const getAllUpcomingAvailabilitiesService = async (tutorProfileId?: string) => {
  return await prisma.availability.findMany({
    where: {
      isBooked: false,
      slot: {
        gt: new Date(), // Filters for slots strictly in the future
      },
      ...(tutorProfileId ? { tutorProfileId } : {}),
    },
    include: {
      tutorProfile: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { slot: "asc" },
  });
};

const getTutorAvailabilitiesService = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutorProfile) throw new Error("Tutor profile not found.");

  return await prisma.availability.findMany({
    where: { tutorProfileId: tutorProfile.id },
    orderBy: { slot: "asc" },
  });
};

const updateAvailabilityService = async (
  id: string,
  userId: string,
  slot: string,
) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found.");

  const availability = await prisma.availability.findUnique({ where: { id } });
  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new Error("Slot not found or unauthorized access.");
  }
  if (availability.isBooked)
    throw new Error("Cannot update an already booked slot.");

  return await prisma.availability.update({
    where: { id },
    data: { slot: new Date(slot) },
  });
};

const deleteAvailabilityService = async (id: string, userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found.");

  const availability = await prisma.availability.findUnique({ where: { id } });
  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new Error("Slot not found or unauthorized access.");
  }
  if (availability.isBooked)
    throw new Error("Cannot delete an already booked slot.");

  return await prisma.availability.delete({ where: { id } });
};

export const availabilityService = {
  createAvailabilityService,
  getAllAvailabilitiesService,
  getTutorAvailabilitiesService,
  updateAvailabilityService,
  deleteAvailabilityService,
  getAllUpcomingAvailabilitiesService,
};
