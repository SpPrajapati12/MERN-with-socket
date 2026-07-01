import { Link, useMatches } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches
    .filter((m) => (m.handle as { crumb?: string })?.crumb)
    .map((m) => ({ label: (m.handle as { crumb: string }).crumb, path: m.pathname }));

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] mb-4">
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-4 w-4" />}
          {i === crumbs.length - 1 ? (
            <span className="text-[hsl(var(--foreground))] font-medium">{c.label}</span>
          ) : (
            <Link to={c.path} className="hover:text-[hsl(var(--foreground))]">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
