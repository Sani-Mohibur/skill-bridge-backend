import { Response } from "express";

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T | null;
};

const sendResponse = <T>(res: Response, responseData: ApiResponse<T>): void => {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    message: responseData.message || "Request handled successfully.",
    data: responseData.data || null,
  });
};

export default sendResponse;
