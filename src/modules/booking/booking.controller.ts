import { Request, Response } from "express";
import { bookingService } from "./booking.service.js";
import catchAsync from "../../utils/catchAsync.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; email: string; name: string };
}

const bookSlot = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  },
);

const cancelBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await bookingService.cancelBookingService(req.user!.id, id as string);
    res.status(200).json({
      success: true,
      message: "Class booking cancelled successfully.",
    });
  },
);

const completeBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { availabilityId } = req.body;
    await bookingService.completeBookingService(req.user!.id, availabilityId);
    res.status(200).json({
      success: true,
      message: "Session marked as completed for all attendees.",
    });
  },
);

const getStudentBookings = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await bookingService.getStudentBookingsService(req.user!.id);
    res.status(200).json({ success: true, data });
  },
);

const getTutorBookings = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await bookingService.getTutorBookingsService(req.user!.id);
    res.status(200).json({ success: true, data });
  },
);

export const bookingController = {
  bookSlot,
  cancelBooking,
  completeBooking,
  getStudentBookings,
  getTutorBookings,
};
