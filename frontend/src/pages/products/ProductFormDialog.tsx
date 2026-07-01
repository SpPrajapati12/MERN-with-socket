import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createProduct, updateProduct } from "@/services/productService";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Product } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  price: z.coerce.number().min(0, "Must be positive"),
  stock: z.coerce.number().int().min(0, "Must be non-negative"),
});

type FormInput = z.input<typeof schema>;
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "");

export default function ProductFormDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput, any, FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(isEdit ? { name: product.name, description: product.description, price: product.price, stock: product.stock } : { name: "", description: "", price: 0, stock: 0 });
      setExistingImages(isEdit ? product.images || [] : []);
      setFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open, product]);

  const removeExisting = (img: string) => setExistingImages((prev) => prev.filter((i) => i !== img));

  const removeNew = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));
      files.forEach((f) => formData.append("images", f));
      if (isEdit) formData.append("keepImages", JSON.stringify(existingImages));

      if (isEdit) await updateProduct(product._id, formData);
      else await createProduct(formData);

      toast({ title: "Success", description: isEdit ? "Product updated" : "Product created" });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + files.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" register={register("name")} error={errors.name?.message} />
          <FormField label="Description" register={register("description")} error={errors.description?.message} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price" type="number" step="0.01" register={register("price")} error={errors.price?.message} />
            <FormField label="Stock" type="number" register={register("stock")} error={errors.stock?.message} />
          </div>
          <div className="space-y-2">
            <Label>Images ({totalImages}/5)</Label>
            {(existingImages.length > 0 || files.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img) => (
                  <div key={img} className="relative group">
                    <img src={`${baseUrl}/${img}`} alt="" className="h-16 w-16 rounded object-cover border" />
                    <button type="button" onClick={() => removeExisting(img)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 rounded object-cover border" />
                    <button type="button" onClick={() => removeNew(i)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {totalImages < 5 && (
              <Input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => {
                const selected = Array.from(e.target.files || []).slice(0, 5 - totalImages);
                setFiles((prev) => [...prev, ...selected]);
                if (fileRef.current) fileRef.current.value = "";
              }} />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
