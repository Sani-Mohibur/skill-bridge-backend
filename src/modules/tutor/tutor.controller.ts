import { Request, Response } from "express";
import { tutorService } from "./tutor.service.js";
import catchAsync from "../../utils/catchAsync.js";
import ApiError from "../../errors/ApiError.js";
import sendResponse from "../../utils/sendResponse.js";

const searchTutors = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    // 1. Extract query params and normalize categories into a string array
    const { search, categories, minPrice, maxPrice, minRating } = req.query;

    let parsedCategories: string[] | undefined = undefined;
    if (typeof categories === "string") {
      parsedCategories = [categories];
    } else if (Array.isArray(categories)) {
      parsedCategories = categories as string[];
    }

    // 2. Pass the cleanly structured filters to your service
    const data = await tutorService.searchTutors({
      search: search as string | undefined,
      categories: parsedCategories,
      minPrice: minPrice as string | undefined,
      maxPrice: maxPrice as string | undefined,
      minRating: minRating as string | undefined,
    });

    if (!data || data.length === 0) {
      throw new ApiError(404, "No tutors found matching your search criteria.");
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tutors retrieved successfully.",
      data: data,
    });
  },
);

export const tutorController = {
  searchTutors,
};
