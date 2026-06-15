import { Router } from "express";
import { tutorController } from "./tutor.controller.js";

const tutorRouter = Router();

// Public endpoint
tutorRouter.get("/search", tutorController.searchTutors);
tutorRouter.get("/categories", tutorController.getAllCategories);

export default tutorRouter;
