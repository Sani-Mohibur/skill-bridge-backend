import { prisma } from "../../lib/prisma.js";

interface TutorFilterQuery {
  search?: string;
  categories?: string[];
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
}

const searchTutors = async (filters: TutorFilterQuery) => {
  const { search, categories, minPrice, maxPrice, minRating } = filters;

  const priceCondition: { gte?: number; lte?: number } = {};
  if (minPrice) priceCondition.gte = parseFloat(minPrice);
  if (maxPrice) priceCondition.lte = parseFloat(maxPrice);

  return await prisma.tutorProfile.findMany({
    where: {
      AND:
        categories && categories.length > 0
          ? categories.map((catId) => ({
              categories: {
                some: { id: catId },
              },
            }))
          : undefined,

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
      categories: { select: { name: true } },
    },
    orderBy: { rating: "desc" },
  });
};

export const tutorService = {
  searchTutors,
};
