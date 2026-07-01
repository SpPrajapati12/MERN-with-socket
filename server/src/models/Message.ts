import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  fileUrl?: string;
  fileType?: "image" | "file";
  fileName?: string;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    fileUrl: String,
    fileType: { type: String, enum: ["image", "file"] },
    fileName: String,
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model<IMessage>("Message", messageSchema);
