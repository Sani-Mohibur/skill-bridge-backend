import { Request, Response } from "express";
import { bookingService } from "./booking.service.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string; name: string };
}

const bookSlot = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { availabilityId } = req.body;
    const data = await bookingService.bookSlotService(
      req.user!.id,
      availabilityId,
    );
    res.status(201).json({
      success: true,
      message: "Enrolled in class successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    await bookingService.cancelBookingService(req.user!.id, id as string);
    res.status(200).json({
      success: true,
      message: "Class booking cancelled successfully.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const completeBooking = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { availabilityId } = req.body;
    await bookingService.completeBookingService(req.user!.id, availabilityId);
    res.status(200).json({
      success: true,
      message: "Session marked as completed for all attendees.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStudentBookings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await bookingService.getStudentBookingsService(req.user!.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTutorBookings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = await bookingService.getTutorBookingsService(req.user!.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookingController = {
  bookSlot,
  cancelBooking,
  completeBooking,
  getStudentBookings,
  getTutorBookings,
};
