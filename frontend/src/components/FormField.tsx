import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

export default function FormField({ label, error, register, ...props }: Props) {
  const id = register?.name;
  return (
    <div className="space-y-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input id={id} {...register} {...props} />
      {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
    </div>
  );
}
