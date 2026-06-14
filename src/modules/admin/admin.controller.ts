import { Request, Response } from "express";
import { adminService } from "./admin.service.js";
import catchAsync from "../../utils/catchAsync.js";
import ApiError from "../../errors/ApiError.js";

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

export const adminController = {
  getDashboardStats,
  toggleUserBan,
};
