import request from "supertest";
import { setupTestDB, createApp } from "../setup";
import User from "../../models/User";
import Product from "../../models/Product";
import { generateAccessToken } from "../../utils/tokenService";
import path from "path";
import fs from "fs";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRES = "15m";
process.env.JWT_REFRESH_EXPIRES = "7d";

setupTestDB();
const app = createApp();

let adminToken: string;
let userToken: string;

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
beforeAll(() => {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
});

beforeEach(async () => {
  const admin = await User.create({ name: "Admin", email: "admin@test.com", password: "password123", role: "admin", isVerified: true });
  const user = await User.create({ name: "User", email: "user@test.com", password: "password123", role: "user", isVerified: true });
  adminToken = generateAccessToken(admin._id.toString());
  userToken = generateAccessToken(user._id.toString());
});

const productData = { name: "Test Product", description: "A test product", price: "29.99", stock: "10" };

describe("POST /api/products", () => {
  it("should create product as admin", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("price", productData.price)
      .field("stock", productData.stock);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Test Product");
    expect(res.body.data.price).toBe(29.99);
  });

  it("should reject non-admin", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .field("name", productData.name)
      .field("description", productData.description)
      .field("price", productData.price)
      .field("stock", productData.stock);
    expect(res.status).toBe(403);
  });

  it("should reject unauthenticated", async () => {
    const res = await request(app).post("/api/products").send(productData);
    expect(res.status).toBe(401);
  });

  it("should reject missing required fields", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "");
    expect(res.status).toBe(400);
  });

  it("should reject negative price", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "X")
      .field("description", "X")
      .field("price", "-5")
      .field("stock", "0");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/products", () => {
  beforeEach(async () => {
    await Product.create([
      { name: "Alpha", description: "First", price: 10, stock: 5 },
      { name: "Beta", description: "Second", price: 20, stock: 3 },
      { name: "Gamma", description: "Third", price: 30, stock: 1 },
    ]);
  });

  it("should return all products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total).toBe(3);
  });

  it("should support pagination", async () => {
    const res = await request(app).get("/api/products?page=1&limit=2");
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.pages).toBe(2);
  });

  it("should support text search", async () => {
    const res = await request(app).get("/api/products?search=Alpha");
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Alpha");
  });
});

describe("GET /api/products/:id", () => {
  it("should return product by id", async () => {
    const product = await Product.create({ name: "Single", description: "One", price: 15, stock: 2 });
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Single");
  });

  it("should return 404 for non-existent product", async () => {
    const res = await request(app).get("/api/products/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/products/:id", () => {
  let productId: string;

  beforeEach(async () => {
    const product = await Product.create({ name: "Old", description: "Old desc", price: 10, stock: 1 });
    productId = product._id.toString();
  });

  it("should update product as admin", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Updated")
      .field("description", "New desc")
      .field("price", "50")
      .field("stock", "20");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated");
    expect(res.body.data.price).toBe(50);
  });

  it("should reject non-admin update", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .field("name", "Hacked");
    expect(res.status).toBe(403);
  });

  it("should return 404 for non-existent product", async () => {
    const res = await request(app)
      .put("/api/products/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "X")
      .field("description", "X")
      .field("price", "1")
      .field("stock", "0");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/products/:id", () => {
  it("should delete product as admin", async () => {
    const product = await Product.create({ name: "ToDelete", description: "Bye", price: 5, stock: 0 });
    const res = await request(app).delete(`/api/products/${product._id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/products/${product._id}`);
    expect(check.status).toBe(404);
  });

  it("should reject non-admin delete", async () => {
    const product = await Product.create({ name: "Keep", description: "Stay", price: 5, stock: 0 });
    const res = await request(app).delete(`/api/products/${product._id}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
