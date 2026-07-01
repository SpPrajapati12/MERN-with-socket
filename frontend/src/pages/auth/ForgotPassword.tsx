import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/toast";
import { forgotPassword } from "@/services/authService";
import { useState } from "react";
import { Link } from "react-router-dom";

const schema = z.object({ email: z.string().email("Valid email required") });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await forgotPassword(data);
      toast({ title: "Success", description: "Reset link sent to your email" });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" type="email" register={register("email")} error={errors.email?.message} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
          <p className="text-sm text-center"><Link to="/login" className="text-[hsl(var(--primary))] hover:underline">Back to Login</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
