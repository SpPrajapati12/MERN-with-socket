import fs from "fs";
import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import AppError from "../utils/AppError";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if ((req.files as Express.Multer.File[])?.length)
      req.body.images = (req.files as Express.Multer.File[]).map((f) => f.path);
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search, sort = "-createdAt" } = req.query;
    const filter = search ? { $text: { $search: search as string } } : {};

    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort(sort as string),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
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

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    const keepImages: string[] = req.body.keepImages ? JSON.parse(req.body.keepImages) : [];
    const newImages = (req.files as Express.Multer.File[])?.map((f) => f.path) || [];

    // Delete removed images from disk
    if (product.images?.length) {
      product.images.filter((img) => !keepImages.includes(img)).forEach((img) => fs.unlink(img, () => {}));
    }

    req.body.images = [...keepImages, ...newImages];
    delete req.body.keepImages;

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    if (product.images?.length) {
      product.images.forEach((img) => fs.unlink(img, () => {}));
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
