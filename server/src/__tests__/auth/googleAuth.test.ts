import request from "supertest";
import { OAuth2Client } from "google-auth-library";
import { createApp, setupTestDB } from "../setup";

setupTestDB();
const app = createApp();

jest.mock("google-auth-library");

const mockVerifyIdToken = jest.fn();

(OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
  verifyIdToken: mockVerifyIdToken,
}));

describe("Google Auth", () => {
  it("should create google user", async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "123",
        email: "test@gmail.com",
        name: "Test User",
        picture: "img",
        email_verified: true,
      }),
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "fake" });

    expect(res.status).toBe(200);
    expect(res.body.user.provider).toBe("google");
  });

  it("should reject missing credential", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .send({});

    expect(res.status).toBe(400);
  });
});