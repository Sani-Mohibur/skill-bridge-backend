import { Request, Response } from "express";
import { profileService } from "./profile.service.js";
import { USER_ROLES } from "../../constants/user.constants.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string; name: string };
}

const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, role } = req.user!;
    const data =
      role === USER_ROLES.STUDENT
        ? await profileService.getStudent(id)
        : await profileService.getTutor(id);

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMyProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, role } = req.user!;
    const data =
      role === USER_ROLES.STUDENT
        ? await profileService.updateStudent(id, req.body)
        : await profileService.updateTutor(id, req.body);

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully.", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const profileController = {
  getMyProfile,
  updateMyProfile,
};
