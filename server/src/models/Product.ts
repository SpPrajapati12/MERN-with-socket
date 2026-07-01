import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export default mongoose.model<IProduct>("Product", productSchema);
