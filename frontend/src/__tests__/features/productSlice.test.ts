import { describe, it, expect } from "vitest";
import productReducer, { setLoading, setError, setProducts, removeProduct } from "@/features/productSlice";

const products = [
  { _id: "1", name: "Product A", description: "Desc A", price: 10, stock: 5, images: [], createdAt: "", updatedAt: "" },
  { _id: "2", name: "Product B", description: "Desc B", price: 20, stock: 3, images: [], createdAt: "", updatedAt: "" },
];
const pagination = { page: 1, limit: 10, total: 2, pages: 1 };

describe("productSlice", () => {
  const initial = { list: [], pagination: null, loading: false, error: null };

  it("should return initial state", () => {
    expect(productReducer(undefined, { type: "unknown" })).toEqual(initial);
  });

  it("should handle setLoading", () => {
    expect(productReducer(initial, setLoading(true)).loading).toBe(true);
  });

  it("should handle setError", () => {
    expect(productReducer(initial, setError("fail")).error).toBe("fail");
  });

  it("should handle setProducts", () => {
    const state = productReducer(initial, setProducts({ data: products, pagination }));
    expect(state.list.length).toBe(2);
    expect(state.pagination?.total).toBe(2);
    expect(state.loading).toBe(false);
  });

  it("should handle removeProduct", () => {
    const withProducts = { ...initial, list: products };
    const state = productReducer(withProducts, removeProduct("1"));
    expect(state.list.length).toBe(1);
    expect(state.list[0]._id).toBe("2");
  });
});
