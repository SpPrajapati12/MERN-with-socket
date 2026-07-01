import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const persisted = JSON.parse(localStorage.getItem("auth") || "null");

const initialState: AuthState = {
  user: persisted?.user || null,
  accessToken: persisted?.accessToken || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.error = null;
      localStorage.setItem("auth", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { setLoading, setError, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
