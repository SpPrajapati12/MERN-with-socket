import api from "./api";

export const getDashboardStats = async () => {
  const [users, products] = await Promise.all([
    api.get("/users", { params: { limit: 1 } }),
    api.get("/products", { params: { limit: 1 } }),
  ]);
  return {
    totalUsers: users.data.pagination.total as number,
    totalProducts: products.data.pagination.total as number,
  };
};
