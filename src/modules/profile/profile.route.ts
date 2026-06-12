import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { USER_ROLES } from "../../constants/user.constants.js";

const profileRouter = Router();

// Both routes are protected; the controller automatically splits logic by role
profileRouter.get(
  "/me",
  requireAuth([USER_ROLES.STUDENT, USER_ROLES.TUTOR]),
  profileController.getMyProfile,
);

profileRouter.put(
  "/update",
  requireAuth([USER_ROLES.STUDENT, USER_ROLES.TUTOR]),
  profileController.updateMyProfile,
);

export default profileRouter;
