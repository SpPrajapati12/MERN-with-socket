import api from "./api";

export const getProducts = (params?: Record<string, unknown>) => api.get("/products", { params });
export const getProduct = (id: string) => api.get(`/products/${id}`);
export const createProduct = (data: FormData) => api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct = (id: string, data: FormData) => api.put(`/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);
