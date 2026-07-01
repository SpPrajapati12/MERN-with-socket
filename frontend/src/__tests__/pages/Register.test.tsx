import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "@/pages/auth/Register";

vi.mock("@/services/authService", () => ({
  register: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe("Register Page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should render register form", () => {
    renderRegister();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("should show validation errors for empty submit", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/name required/i)).toBeInTheDocument();
    expect(await screen.findByText(/valid email required/i)).toBeInTheDocument();
    expect(await screen.findByText(/min 6 characters/i)).toBeInTheDocument();
  });

  it("should show error for short password", async () => {
    renderRegister();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/name/i), "Test");
    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "123");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/min 6 characters/i)).toBeInTheDocument();
  });

  it("should call register service with valid data", async () => {
    const { register: registerApi } = await import("@/services/authService");
    (registerApi as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { success: true } });

    renderRegister();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@test.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(registerApi).toHaveBeenCalledWith({ name: "Test User", email: "test@test.com", password: "password123" });
  });

  it("should have link to login page", () => {
    renderRegister();
    expect(screen.getByText(/login/i)).toHaveAttribute("href", "/login");
  });
});
