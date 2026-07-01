import request from "supertest";
import { setupTestDB, createApp } from "../setup";
import User from "../../models/User";
import { generateAccessToken } from "../../utils/tokenService";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRES = "15m";
process.env.JWT_REFRESH_EXPIRES = "7d";

setupTestDB();
const app = createApp();

let adminToken: string;
let userToken: string;
let userId: string;

beforeEach(async () => {
  const admin = await User.create({ name: "Admin", email: "admin@test.com", password: "password123", role: "admin", isVerified: true });
  const user = await User.create({ name: "User", email: "user@test.com", password: "password123", role: "user", isVerified: true });
  adminToken = generateAccessToken(admin._id.toString());
  userToken = generateAccessToken(user._id.toString());
  userId = user._id.toString();
});

describe("GET /api/users", () => {
  it("should return users list for admin", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
  });

  it("should reject non-admin", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("should reject unauthenticated", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("should support search", async () => {
    const res = await request(app).get("/api/users?search=Admin").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Admin");
  });

  it("should support role filter", async () => {
    const res = await request(app).get("/api/users?role=admin").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(1);
  });

  it("should support pagination", async () => {
    const res = await request(app).get("/api/users?page=1&limit=1").set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.pages).toBe(2);
  });
});

describe("GET /api/users/:id", () => {
  it("should return user by id", async () => {
    const res = await request(app).get(`/api/users/${userId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("user@test.com");
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app).get(`/api/users/${fakeId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid id", async () => {
    const res = await request(app).get("/api/users/invalidid").set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/users/:id", () => {
  it("should update user", async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("should return 404 for non-existent user", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const res = await request(app)
      .put(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete user as admin", async () => {
    const res = await request(app).delete(`/api/users/${userId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/users/${userId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(check.status).toBe(404);
  });

  it("should reject non-admin delete", async () => {
    const res = await request(app).delete(`/api/users/${userId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
