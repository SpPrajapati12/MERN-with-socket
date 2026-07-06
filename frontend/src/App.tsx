import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { ToastProvider } from "@/components/ui/toast";
import router from "@/routes";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      >
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
