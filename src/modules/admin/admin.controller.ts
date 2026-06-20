import { Request, Response } from "express";
import { adminService } from "./admin.service.js";
import catchAsync from "../../utils/catchAsync.js";
import ApiError from "../../errors/ApiError.js";
import sendResponse from "../../utils/sendResponse.js";

const getDashboardStats = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const data = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data });
  },
);

const toggleUserBan = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { banned } = req.body;

    if (typeof banned !== "boolean") {
      throw new ApiError(400, "The 'banned' field must be a boolean value.");
    }

    const data = await adminService.updateUserBanStatus(
      userId as string,
      banned,
    );
    const message = banned
      ? "User has been banned."
      : "User has been unbanned.";

    res.status(200).json({ success: true, message, data });
  },
);

const createCategory = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new ApiError(
        400,
        "Category name is required and must be a valid string.",
      );
    }

    const data = await adminService.createCategory(name);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data,
    });
  },
);

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await adminService.deleteCategory(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully.",
    data: null,
  });
});

const toggleTutorFeatured = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // tutorProfileId
    const { isFeatured } = req.body;

    if (typeof isFeatured !== "boolean") {
      throw new ApiError(
        400,
        "The 'isFeatured' field must be a boolean value.",
      );
    }

    const data = await adminService.updateTutorFeaturedStatus(
      id as string,
      isFeatured,
    );

    const message = isFeatured
      ? "Tutor has been featured successfully."
      : "Tutor has been removed from featured list.";

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message,
      data,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllUsers(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User account records fetched successfully.",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const adminController = {
  getDashboardStats,
  toggleUserBan,
  createCategory,
  deleteCategory,
  toggleTutorFeatured,
  getAllUsers,
};
