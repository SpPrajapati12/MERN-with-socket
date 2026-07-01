import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

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
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
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
