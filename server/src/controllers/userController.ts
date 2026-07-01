import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import AppError from "../utils/AppError";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const filter: any = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort("-createdAt"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
