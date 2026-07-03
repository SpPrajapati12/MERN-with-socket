import axios from "axios";

// FIX: If VITE_API_URL is undefined (like in a production Docker container), 
// fallback cleanly to the relative proxy path '/api'
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ 
  baseURL: BASE_URL 
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  if (auth.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        
        // FIX: Use the safe BASE_URL variable here instead of the raw env statement
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken: auth.refreshToken,
        });
        
        const updated = { ...auth, accessToken: data.accessToken, refreshToken: data.refreshToken };
        localStorage.setItem("auth", JSON.stringify(updated));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;