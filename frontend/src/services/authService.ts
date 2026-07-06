import api from "./api";

export const login = (data: { email: string; password: string }) => api.post("/auth/login", data);
export const register = (data: { name: string; email: string; password: string }) => api.post("/auth/register", data);
export const forgotPassword = (data: { email: string }) => api.post("/auth/forgot-password", data);
export const resetPassword = (token: string, data: { password: string }) => api.post(`/auth/reset-password/${token}`, data);
export const changePassword = (data: { currentPassword: string; newPassword: string }) => api.put("/auth/change-password", data);


export const googleLogin = async (credential: string) => {
  const response = await api.post("/auth/google", {
    credential,
  });

  return response.data;
};
