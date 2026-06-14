import { Request, Response } from "express";
import { tutorService } from "./tutor.service.js";
import catchAsync from "../../utils/catchAsync.js";
import ApiError from "../../errors/ApiError.js";

const searchTutors = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const data = await tutorService.searchTutors(req.query);

    if (!data || data.length === 0) {
      throw new ApiError(404, "No tutors found matching your search criteria.");
    }

    res.status(200).json({ success: true, data });
  },
);

export const tutorController = {
  searchTutors,
};
