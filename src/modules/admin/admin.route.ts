import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { USER_ROLES } from "../../constants/user.constants.js";

const adminRouter = Router();

// Secure all admin endpoints exclusively for users with the "admin" role
adminRouter.use(requireAuth([USER_ROLES.ADMIN as any]));

adminRouter.get("/stats", adminController.getDashboardStats);
adminRouter.patch("/users/:userId/ban", adminController.toggleUserBan);
adminRouter.post("/categories", adminController.createCategory);

export default adminRouter;
