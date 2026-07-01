import { configureStore, Tuple } from "@reduxjs/toolkit";
import authReducer from "@/features/authSlice";
import userReducer from "@/features/userSlice";
import productReducer from "@/features/productSlice";
import chatReducer from "@/features/chatSlice";

export const store = configureStore({
  reducer: { auth: authReducer, users: userReducer, products: productReducer, chat: chatReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
