import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-lg border px-4 py-3 shadow-lg text-sm min-w-[300px]",
              t.variant === "destructive"
                ? "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
                : "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
            )}
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && <p className="opacity-80">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
