import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "ValidationError") {
    err = new AppError(
      Object.values(err.errors).map((e: any) => e.message).join(", "),
      400
    );
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err = new AppError(`Duplicate value for '${field}'`, 409);
  }
  if (err.name === "CastError") {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
