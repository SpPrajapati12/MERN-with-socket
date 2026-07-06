import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/toast";
import { createuser, updateUser } from "@/services/userService";
import { useState, useEffect } from "react";
import type { User } from "@/types";
import SelectField from "@/components/SelectField";

const baseSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  password: z.string().optional(),
  role: z.enum(["user", "admin"] as const),
});

const createSchema = baseSchema.extend({
  password: z.string().min(6, "Min 6 characters"),
});

const editSchema = baseSchema.omit({ password: true });

type FormData = z.infer<typeof baseSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess: () => void;
}

export default function UserFormDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const isEdit = !!user;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  useEffect(() => {
    if (open) reset(isEdit ? { name: user.name, email: user.email, role: user.role } : { name: "", email: "", password: "", role: "user" });
  }, [open, user]);

  const onSubmit = async (data: any) => {
    console.log("Submitting form data:", data);
    setLoading(true);
    try {
      if (isEdit) await updateUser(user._id, data);
      else await createuser(data);
      toast({ title: "Success", description: isEdit ? "User updated" : "User created" });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" register={register("name")} error={errors.name?.message as string} />
          <FormField label="Email" type="email" register={register("email")} error={errors.email?.message as string} />
          {!isEdit && <FormField label="Password" type="password" register={register("password")} error={errors.password?.message as string} />}
          <SelectField
            label="Role"
            register={register("role")}
            error={errors.role?.message}
            defaultValue="user"
            options={[
              { label: "User", value: "user" },
              { label: "Admin", value: "admin" },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
