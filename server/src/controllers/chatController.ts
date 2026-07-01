import { Request, Response, NextFunction } from "express";
import axios from "axios";
import FormData from "form-data";
import Message from "../models/Message";
import User from "../models/User";

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const me = (req as any).user._id;
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const before = req.query.before as string;

    const filter: any = {
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name email role");

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

export const getChatUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const me = (req as any).user._id;
    const users = await User.find({ _id: { $ne: me } }).select("name email role").sort("name");
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, message: "No file provided" });

    const isImage = file.mimetype.startsWith("image/");
    const formData = new FormData();
    formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
    formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "chat_uploads");
    formData.append("folder", "chat");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const resourceType = isImage ? "image" : "raw";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const { data: result } = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });

    res.json({
      success: true,
      data: { url: result.secure_url, fileType: isImage ? "image" : "file", fileName: file.originalname },
    });
  } catch (err: any) {
    console.error("[Upload Error]", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "File upload failed" });
  }
};
