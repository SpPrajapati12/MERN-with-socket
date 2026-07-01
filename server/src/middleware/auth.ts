import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokenService";
import User from "../models/User";
import AppError from "../utils/AppError";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      throw new AppError("Authentication required", 401);

    const decoded = verifyAccessToken(header.split(" ")[1]);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User not found", 401);

    (req as any).user = user;
    next();
  } catch (err: any) {
    next(err.isOperational ? err : new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!roles.includes((req as any).user.role))
    return next(new AppError("Insufficient permissions", 403));
  next();
};
