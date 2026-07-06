import { describe, it, expect } from "vitest";
import authReducer, {
  setLoading,
  setError,
  setCredentials,
  logout,
} from "@/features/authSlice";

const user = {
  _id: "1",
  name: "Test",
  email: "test@test.com",
  role: "user" as const,
  isVerified: true,
  createdAt: "",
  updatedAt: "",
};

describe("authSlice", () => {
  const initial = {
    user: null,
    accessToken: null,
    refreshToken: null, // ✅ FIX ADDED
    loading: false,
    error: null,
  };

  it("should return initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initial);
  });

  it("should handle setLoading", () => {
    const state = authReducer(initial, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it("should handle setError", () => {
    const state = authReducer(initial, setError("Something went wrong"));
    expect(state.error).toBe("Something went wrong");
  });

  it("should handle setCredentials", () => {
    const payload = {
      user,
      accessToken: "abc",
      refreshToken: "xyz", // ✅ FIX ADDED
    };

    const state = authReducer(initial, setCredentials(payload));

    expect(state.user).toEqual(user);
    expect(state.accessToken).toBe("abc");
    expect(state.refreshToken).toBe("xyz"); // ✅ ADD THIS
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should handle logout", () => {
    const loggedIn = {
      user,
      accessToken: "abc",
      refreshToken: "xyz", // ✅ FIX ADDED
      loading: false,
      error: null,
    };

    const state = authReducer(loggedIn, logout());

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull(); // ✅ ADD THIS
  });
});