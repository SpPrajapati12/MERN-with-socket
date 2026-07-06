import api from "./api";

export const getUsers = (params?: Record<string, unknown>) => api.get("/users", { params });
export const createuser = (data: { name: string; email: string; password: string, role: string }) => api.post("/users/createuser", data);
export const getUser = (id: string) => api.get(`/users/${id}`);
export const updateUser = (id: string, data: { name?: string; email?: string; role?: string }) => api.put(`/users/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
