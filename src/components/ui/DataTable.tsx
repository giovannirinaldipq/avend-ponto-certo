"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/design-system";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: T[keyof T], row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "Nenhum dado encontrado",
  loading = false,
  striped = false,
  hoverable = true,
  compact = false,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;
    const key = String(column.key);
    if (sortKey !== key) return <ChevronsUpDown size={14} className="text-muted/50" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  const cellPadding = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    cellPadding,
                    "text-xs font-semibold text-muted uppercase tracking-wider",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sortable && "cursor-pointer select-none hover:bg-gray-100/50 transition-colors"
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className={cn("flex items-center gap-1", col.align === "right" && "justify-end", col.align === "center" && "justify-center")}>
                    {col.header}
                    <SortIcon column={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIndex) => (
                  <motion.tr
                    key={keyExtractor(row)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: rowIndex * 0.02 }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      striped && rowIndex % 2 === 1 && "bg-gray-50/30",
                      hoverable && "hover:bg-primary/5",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => {
                      const value = row[col.key as keyof T];
                      return (
                        <td
                          key={String(col.key)}
                          className={cn(
                            cellPadding,
                            "text-sm text-navy",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          )}
                        >
                          {col.render ? col.render(value, row, rowIndex) : String(value ?? "-")}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
