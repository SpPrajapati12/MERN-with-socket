import { createContext, useContext, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType>({ open: false, onOpenChange: () => {} });

function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

function DialogContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className={cn("relative z-50 w-full max-w-lg rounded-lg border bg-[hsl(var(--background))] p-6 shadow-lg", className)} {...props}>
        <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">✕</button>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle };
