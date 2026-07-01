import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product, Pagination } from "@/types";

interface ProductState {
  list: Product[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  pagination: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProducts: (state, action: PayloadAction<{ data: Product[]; pagination: Pagination }>) => {
      state.list = action.payload.data;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((p) => p._id !== action.payload);
    },
  },
});

export const { setLoading, setError, setProducts, removeProduct } = productSlice.actions;
export default productSlice.reducer;
