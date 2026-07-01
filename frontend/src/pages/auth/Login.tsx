import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, setLoading, setError } from "@/features/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/toast";
import { login } from "@/services/authService";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, user } = useAppSelector((s) => s.auth);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const onSubmit = async (data: FormData) => {
    dispatch(setLoading(true));
    try {
      const res = await login(data);
      dispatch(setCredentials(res.data));
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      dispatch(setError(msg));
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Email" type="email" register={register("email")} error={errors.email?.message} />
          <FormField label="Password" type="password" register={register("password")} error={errors.password?.message} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          <div className="text-sm text-center space-y-1">
            <Link to="/forgot-password" className="text-[hsl(var(--primary))] hover:underline block">Forgot password?</Link>
            <span>Don't have an account? <Link to="/register" className="text-[hsl(var(--primary))] hover:underline">Register</Link></span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
