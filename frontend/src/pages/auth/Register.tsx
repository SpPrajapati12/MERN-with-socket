import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/toast";
import { register as registerApi } from "@/services/authService";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  console.log(errors);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerApi(data);
      toast({ title: "Success", description: "Registration successful! Please verify your email." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Registration failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" register={register("name")} error={errors.name?.message} />
          <FormField label="Email" type="email" register={register("email")} error={errors.email?.message} />
          <FormField label="Password" type="password" register={register("password")} error={errors.password?.message} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
          <p className="text-sm text-center">Already have an account? <Link to="/login" className="text-[hsl(var(--primary))] hover:underline">Login</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
