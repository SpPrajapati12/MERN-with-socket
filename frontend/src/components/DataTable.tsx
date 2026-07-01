import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import RPaginate from "react-paginate";
const ReactPaginate = (RPaginate as any).default || RPaginate;
import type { Column, Pagination } from "@/types";

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pagination: Pagination | null;
  onParamsChange: (params: { search: string; sort: string; page: number }) => void;
  searchPlaceholder?: string;
}

export default function DataTable<T extends { _id?: string }>({ columns, data, loading, pagination, onParamsChange, searchPlaceholder = "Search..." }: Props<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    onParamsChange({ search: debouncedSearch, sort, page: 1 });
  }, [debouncedSearch, sort]);

  const toggleSort = (key: string) => {
    if (!key) return;
    setSort((prev) => (prev === key ? `-${key}` : prev === `-${key}` ? "" : key));
  };

  const SortIcon = ({ field }: { field?: string }) => {
    if (!field) return null;
    if (sort === field) return <ChevronUp className="ml-1 h-4 w-4 inline" />;
    if (sort === `-${field}`) return <ChevronDown className="ml-1 h-4 w-4 inline" />;
    return <ChevronsUpDown className="ml-1 h-4 w-4 inline opacity-40" />;
  };

  return (
    <div className="space-y-4">
      <Input placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.sortable ? "cursor-pointer select-none" : ""} onClick={() => col.sortable && toggleSort(col.key)}>
                {col.label}
                {col.sortable && <SortIcon field={col.key} />}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            : data?.length === 0
            ? <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-[hsl(var(--muted-foreground))]">No data found</TableCell></TableRow>
            : data?.map((row, i) => (
                <TableRow key={row._id || i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}</TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <ReactPaginate
            pageCount={pagination.pages}
            forcePage={pagination.page - 1}
            onPageChange={({ selected }: { selected: number }) => onParamsChange({ search: debouncedSearch, sort, page: selected + 1 })}
            previousLabel="← Prev"
            nextLabel="Next →"
            containerClassName="flex items-center gap-1"
            pageClassName="[&>a]:inline-flex [&>a]:items-center [&>a]:justify-center [&>a]:h-8 [&>a]:min-w-8 [&>a]:px-2 [&>a]:rounded-md [&>a]:border [&>a]:border-[hsl(var(--border))] [&>a]:text-sm [&>a]:cursor-pointer hover:[&>a]:bg-[hsl(var(--accent))]"
            activeClassName="[&>a]:bg-[hsl(var(--primary))] [&>a]:text-[hsl(var(--primary-foreground))] hover:[&>a]:bg-[hsl(var(--primary))]"
            previousClassName="[&>a]:inline-flex [&>a]:items-center [&>a]:h-8 [&>a]:px-3 [&>a]:rounded-md [&>a]:border [&>a]:border-[hsl(var(--border))] [&>a]:text-sm [&>a]:cursor-pointer hover:[&>a]:bg-[hsl(var(--accent))]"
            nextClassName="[&>a]:inline-flex [&>a]:items-center [&>a]:h-8 [&>a]:px-3 [&>a]:rounded-md [&>a]:border [&>a]:border-[hsl(var(--border))] [&>a]:text-sm [&>a]:cursor-pointer hover:[&>a]:bg-[hsl(var(--accent))]"
            disabledClassName="opacity-50 [&>a]:pointer-events-none"
            breakClassName="[&>a]:inline-flex [&>a]:items-center [&>a]:justify-center [&>a]:h-8 [&>a]:min-w-8 [&>a]:text-sm"
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
          />
        </div>
      )}
    </div>
  );
}
