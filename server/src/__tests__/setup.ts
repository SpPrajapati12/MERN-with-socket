import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express, { Express } from "express";
import cors from "cors";
import errorHandler from "../middleware/errorHandler";
import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import productRoutes from "../routes/productRoutes";

let mongoServer: MongoMemoryServer;

export let app: Express;

export const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
};

export const createApp = (): Express => {
  const testApp = express();
  testApp.use(cors());
  testApp.use(express.json());
  testApp.use("/api/auth", authRoutes);
  testApp.use("/api/users", userRoutes);
  testApp.use("/api/products", productRoutes);
  testApp.use(errorHandler);
  app = testApp;
  return testApp;
};
