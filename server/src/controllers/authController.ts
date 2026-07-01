import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import AppError from "../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  verifyRefreshToken,
} from "../utils/tokenService";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/emailService";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email }))
      throw new AppError("Email already registered", 409);

    const verificationToken = generateRandomToken();
    const user = await User.create({ name, email, password, verificationToken, isVerified: false });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) throw new AppError("Invalid verification token", 400);

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};
                          
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password)))
      throw new AppError("Invalid email or password", 401);

    res.json({
      success: true,
      accessToken: generateAccessToken(user._id.toString()),
      refreshToken: generateRefreshToken(user._id.toString()),
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 400);

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User not found", 401);

    res.json({
      success: true,
      accessToken: generateAccessToken(user._id.toString()),
      refreshToken: generateRefreshToken(user._id.toString()),
    });
  } catch (err: any) {
    next(err.isOperational ? err : new AppError("Invalid refresh token", 401));
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new AppError("No account with that email", 404);

    const token = generateRandomToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendResetPasswordEmail(user.email, token);

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) throw new AppError("Invalid or expired reset token", 400);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!(await user!.comparePassword(req.body.currentPassword)))
      throw new AppError("Current password is incorrect", 400);

    user!.password = req.body.newPassword;
    await user!.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};
