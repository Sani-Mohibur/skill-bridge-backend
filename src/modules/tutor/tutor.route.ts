import { Router } from "express";
import { tutorController } from "./tutor.controller.js";

const tutorRouter = Router();

// Public endpoint
tutorRouter.get("/search", tutorController.searchTutors);

export default tutorRouter;
