import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setProducts, setLoading, removeProduct } from "@/features/productSlice";
import * as productService from "@/services/productService";
import DataTable from "@/components/DataTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProductFormDialog from "./ProductFormDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Product, Column } from "@/types";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { list, pagination, loading } = useAppSelector((s) => s.products);
  const { user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();
  const [params, setParams] = useState({ page: 1, search: "", sort: "" });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const { data } = await productService.getProducts({ page: params.page, search: params.search || undefined, sort: params.sort || undefined, limit: 10 });
      dispatch(setProducts(data));
    } catch {
      dispatch(setLoading(false));
    }
  }, [dispatch, params.page, params.search, params.sort]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteId);
      dispatch(removeProduct(deleteId));
      toast({ title: "Deleted", description: "Product deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Product>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", render: (row) => <span className="line-clamp-1 max-w-[200px]">{row.description}</span> },
    { key: "price", label: "Price", sortable: true, render: (row) => `$${row.price.toFixed(2)}` },
    { key: "stock", label: "Stock", sortable: true },
    {
      key: "images",
      label: "Image",
      render: (row) =>
        row.images?.[0] ? (
          <img src={`${import.meta.env.VITE_API_URL?.replace("/api", "")}/${row.images[0]}`} alt={row.name} className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-[hsl(var(--muted))]" />
        ),
    },
    ...(isAdmin
      ? [{
          key: "actions",
          label: "Actions",
          render: (row: Product) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setEditProduct(row); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(row._id)}><Trash2 className="h-4 w-4 text-[hsl(var(--destructive))]" /></Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        {isAdmin && <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Product</Button>}
      </div>
      <DataTable columns={columns} data={list} loading={loading} pagination={pagination} onParamsChange={setParams} searchPlaceholder="Search products..." />
      {isAdmin && <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} onSuccess={load} />}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} description="This will permanently delete this product." />
    </div>
  );
}
