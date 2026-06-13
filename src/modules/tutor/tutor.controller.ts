import { Request, Response } from "express";
import { tutorService } from "./tutor.service.js";

const searchTutors = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await tutorService.searchTutors(req.query);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const tutorController = {
  searchTutors,
};
