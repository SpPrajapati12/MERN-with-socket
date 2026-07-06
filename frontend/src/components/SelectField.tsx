import { Label } from "@/components/ui/label";
import type { SelectHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  register?: UseFormRegisterReturn;
  options: Option[];
}

export default function SelectField({
  label,
  error,
  register,
  options,
  ...props
}: Props) {
  const id = register?.name;

  return (
    <div className="space-y-1">
      {label && <Label htmlFor={id}>{label}</Label>}

      <select
        id={id}
        {...register}
        {...props}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}