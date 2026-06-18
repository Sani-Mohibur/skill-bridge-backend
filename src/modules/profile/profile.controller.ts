import { Request, Response } from "express";
import { profileService } from "./profile.service.js";
import { USER_ROLES } from "../../constants/user.constants.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string; name: string };
}

const getMyProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id, role } = req.user!;
    const data =
      role === USER_ROLES.STUDENT
        ? await profileService.getStudent(id)
        : await profileService.getTutor(id);

    res.status(200).json({ success: true, data });
  },
);

const updateMyProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id, role } = req.user!;
    const data =
      role === USER_ROLES.STUDENT
        ? await profileService.updateStudent(id, req.body)
        : await profileService.updateTutor(id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully.",
      data,
    });
  },
);

export const profileController = {
  getMyProfile,
  updateMyProfile,
};
