import { Request, Response } from "express";
import { availabilityService } from "./availability.service.js";

// Custom interface extending Express Request to safely read req.user from middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

const addAvailabilitySlot = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { slot } = req.body;

  if (!slot) {
    res.status(400).json({
      success: false,
      message: "A valid date-time slot string is required.",
    });
    return;
  }

  try {
    // Pass the authenticated user id from middleware context down to the service layer
    const data = await availabilityService.createAvailabilityService({
      userId: req.user!.id,
      slot,
    });

    res.status(201).json({
      success: true,
      message: "Availability slot published successfully.",
      data,
    });
  } catch (error: any) {
    console.error("❌ Add Availability Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server availability engine error.",
    });
  }
};

const getAllAvailabilities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { tutorId } = req.query;
    const data = await availabilityService.getAllAvailabilitiesService(
      tutorId as string,
    );
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTutorAvailabilities = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await availabilityService.getTutorAvailabilitiesService(
      req.user!.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAvailabilitySlot = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { slot } = req.body;
    if (!slot) {
      res
        .status(400)
        .json({ success: false, message: "Slot date is required." });
      return;
    }
    const data = await availabilityService.updateAvailabilityService(
      id as string,
      req.user!.id,
      slot,
    );
    res
      .status(200)
      .json({ success: true, message: "Slot updated successfully.", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAvailabilitySlot = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    await availabilityService.deleteAvailabilityService(
      id as string,
      req.user!.id,
    );
    res
      .status(200)
      .json({ success: true, message: "Slot deleted successfully." });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const availabilityController = {
  addAvailabilitySlot,
  getAllAvailabilities,
  getTutorAvailabilities,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
};
