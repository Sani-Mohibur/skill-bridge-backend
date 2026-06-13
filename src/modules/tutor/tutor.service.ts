import { prisma } from "../../lib/prisma.js";

interface TutorFilterQuery {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
}

const searchTutors = async (filters: TutorFilterQuery) => {
  const { search, categoryId, minPrice, maxPrice, minRating } = filters;

  // Build conditions safely without passing nested undefined values
  const priceCondition: { gte?: number; lte?: number } = {};
  if (minPrice) priceCondition.gte = parseFloat(minPrice);
  if (maxPrice) priceCondition.lte = parseFloat(maxPrice);

  return await prisma.tutorProfile.findMany({
    where: {
      categoryId: categoryId || undefined,
      // Only inject the price object if at least one filter is applied
      pricePerHour: minPrice || maxPrice ? priceCondition : undefined,
      rating: minRating ? { gte: parseFloat(minRating) } : undefined,
      user: search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : undefined,
    },
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
    orderBy: { rating: "desc" },
  });
};

export const tutorService = {
  // ... your existing methods
  searchTutors,
};
