// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "dotenv/config";
import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db";
import swaggerSpec from "./config/swagger";
import { initSocket } from "./config/socket";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import chatRoutes from "./routes/chatRoutes";
import nodemailer from "nodemailer";


const app = express();
const server = http.createServer(app);

const HOST = "0.0.0.0";

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "API is running" }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});


app.get("/test-email", async (req, res) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    subject: "Test Email",
    text: "SMTP working 🚀",
  });

  res.send("Email sent");
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  initSocket(server);
  server.listen(Number(PORT), HOST, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  });
});
