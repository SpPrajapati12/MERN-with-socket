import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "@/features/authSlice";
import userReducer from "@/features/userSlice";
import productReducer from "@/features/productSlice";
import Login from "@/pages/auth/Login";

vi.mock("@/services/authService", () => ({
  login: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const createStore = () =>
  configureStore({
    reducer: { auth: authReducer, users: userReducer, products: productReducer },
  });

const renderLogin = () =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );

describe("Login Page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should render login form", () => {
    renderLogin();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should show validation errors for empty submit", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/valid email required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password required/i)).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "notanemail");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/valid email required/i)).toBeInTheDocument();
  });

  it("should call login service with valid data", async () => {
    const { login } = await import("@/services/authService");
    (login as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: { _id: "1", name: "Test", email: "test@test.com", role: "user" }, accessToken: "abc", refreshToken: "xyz" },
    });

    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({ email: "test@test.com", password: "password123" });
  });

  it("should have link to register page", () => {
    renderLogin();
    expect(screen.getByText(/register/i)).toHaveAttribute("href", "/register");
  });

  it("should have link to forgot password", () => {
    renderLogin();
    expect(screen.getByText(/forgot password/i)).toHaveAttribute("href", "/forgot-password");
  });
});
