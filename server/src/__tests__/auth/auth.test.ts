import request from "supertest";
import { setupTestDB, createApp } from "../setup";
import User from "../../models/User";
import { generateAccessToken } from "../../utils/tokenService";

// Set env vars for tests
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRES = "15m";
process.env.JWT_REFRESH_EXPIRES = "7d";

setupTestDB();
const app = createApp();

const testUser = { name: "Test User", email: "test@example.com", password: "password123" };

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.isVerified).toBe(true);
  });

  it("should reject duplicate email", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(409);
  });

  it("should reject missing name", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "123456" });
    expect(res.status).toBe(400);
  });

  it("should reject invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "invalid", password: "123456" });
    expect(res.status).toBe(400);
  });

  it("should reject short password", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "a@b.com", password: "123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(testUser);
  });

  it("should login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: testUser.email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "no@exist.com", password: "123456" });
    expect(res.status).toBe(401);
  });

  it("should reject missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/refresh-token", () => {
  it("should issue new tokens with valid refresh token", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const login = await request(app).post("/api/auth/login").send({ email: testUser.email, password: testUser.password });

    const res = await request(app).post("/api/auth/refresh-token").send({ refreshToken: login.body.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("should reject missing refresh token", async () => {
    const res = await request(app).post("/api/auth/refresh-token").send({});
    expect(res.status).toBe(400);
  });

  it("should reject invalid refresh token", async () => {
    const res = await request(app).post("/api/auth/refresh-token").send({ refreshToken: "invalid" });
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/auth/change-password", () => {
  let token: string;

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const login = await request(app).post("/api/auth/login").send({ email: testUser.email, password: testUser.password });
    token = login.body.accessToken;
  });

  it("should change password with valid current password", async () => {
    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "password123", newPassword: "newpass123" });
    expect(res.status).toBe(200);

    // Verify new password works
    const login = await request(app).post("/api/auth/login").send({ email: testUser.email, password: "newpass123" });
    expect(login.status).toBe(200);
  });

  it("should reject wrong current password", async () => {
    const res = await request(app)
      .put("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "wrongpass", newPassword: "newpass123" });
    expect(res.status).toBe(400);
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app).put("/api/auth/change-password").send({ currentPassword: "password123", newPassword: "newpass123" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("should return success for existing email", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/forgot-password").send({ email: testUser.email });
    expect(res.status).toBe(200);

    const user = await User.findOne({ email: testUser.email }).select("+resetPasswordToken");
    expect(user?.resetPasswordToken).toBeDefined();
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "no@exist.com" });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/reset-password/:token", () => {
  it("should reset password with valid token", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    await request(app).post("/api/auth/forgot-password").send({ email: testUser.email });

    const user = await User.findOne({ email: testUser.email });
    const res = await request(app)
      .post(`/api/auth/reset-password/${user!.resetPasswordToken}`)
      .send({ password: "resetpass123" });
    expect(res.status).toBe(200);

    const login = await request(app).post("/api/auth/login").send({ email: testUser.email, password: "resetpass123" });
    expect(login.status).toBe(200);
  });

  it("should reject invalid token", async () => {
    const res = await request(app).post("/api/auth/reset-password/invalidtoken").send({ password: "newpass123" });
    expect(res.status).toBe(400);
  });
});
