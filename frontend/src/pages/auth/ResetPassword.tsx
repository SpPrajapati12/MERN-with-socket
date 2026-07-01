import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/toast";
import { resetPassword } from "@/services/authService";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const schema = z.object({ password: z.string().min(6, "Min 6 characters") });
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await resetPassword(token!, data);
      toast({ title: "Success", description: "Password reset successful" });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="New Password" type="password" register={register("password")} error={errors.password?.message} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
