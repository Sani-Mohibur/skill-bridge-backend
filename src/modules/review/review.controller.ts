import { Request, Response } from "express";
import { reviewService } from "./review.service.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string; name: string };
}

const add = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const data = await reviewService.add({
      studentUserId: req.user!.id,
      bookingId,
      rating,
      comment,
    });
    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully.", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getByTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tutorProfileId } = req.params;
    const data = await reviewService.getByTutor(tutorProfileId as string);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyReviews = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await reviewService.getMyReviews(req.user!.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewController = {
  add,
  getByTutor,
  getMyReviews,
};
