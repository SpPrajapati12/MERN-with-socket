import { describe, it, expect } from "vitest";
import userReducer, { setLoading, setError, setUsers, removeUser } from "@/features/userSlice";

const users = [
  { _id: "1", name: "Alice", email: "alice@test.com", role: "user" as const, isVerified: true, createdAt: "", updatedAt: "" },
  { _id: "2", name: "Bob", email: "bob@test.com", role: "admin" as const, isVerified: true, createdAt: "", updatedAt: "" },
];
const pagination = { page: 1, limit: 10, total: 2, pages: 1 };

describe("userSlice", () => {
  const initial = { list: [], pagination: null, loading: false, error: null };

  it("should return initial state", () => {
    expect(userReducer(undefined, { type: "unknown" })).toEqual(initial);
  });

  it("should handle setLoading", () => {
    expect(userReducer(initial, setLoading(true)).loading).toBe(true);
  });

  it("should handle setError", () => {
    expect(userReducer(initial, setError("fail")).error).toBe("fail");
  });

  it("should handle setUsers", () => {
    const state = userReducer(initial, setUsers({ data: users, pagination }));
    expect(state.list.length).toBe(2);
    expect(state.pagination?.total).toBe(2);
    expect(state.loading).toBe(false);
  });

  it("should handle removeUser", () => {
    const withUsers = { ...initial, list: users };
    const state = userReducer(withUsers, removeUser("1"));
    expect(state.list.length).toBe(1);
    expect(state.list[0]._id).toBe("2");
  });
});
