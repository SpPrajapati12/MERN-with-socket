import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User, Pagination } from "@/types";

interface UserState {
  list: User[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  list: [],
  pagination: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUsers: (state, action: PayloadAction<{ data: User[]; pagination: Pagination }>) => {
      state.list = action.payload.data;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u._id !== action.payload);
    },
  },
});

export const { setLoading, setError, setUsers, removeUser } = userSlice.actions;
export default userSlice.reducer;
