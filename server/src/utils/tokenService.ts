import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  } as SignOptions);

export const generateRefreshToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  } as SignOptions);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };

export const generateRandomToken = () => crypto.randomBytes(32).toString("hex");
