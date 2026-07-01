import { createContext, useContext, useState, useEffect, useRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}

function DropdownMenuTrigger({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useContext(DropdownContext);
  return <div onClick={() => setOpen(!open)} className="cursor-pointer" {...props}>{children}</div>;
}

function DropdownMenuContent({ className, children, align = "end", ...props }: HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  const { open, setOpen } = useContext(DropdownContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] rounded-md border bg-[hsl(var(--popover))] p-1 text-[hsl(var(--popover-foreground))] shadow-md",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, onClick, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = useContext(DropdownContext);
  return (
    <div
      className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-[hsl(var(--accent))]", className)}
      onClick={(e) => { onClick?.(e); setOpen(false); }}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-[hsl(var(--border))]", className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
