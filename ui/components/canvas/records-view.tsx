"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  Columns3,
  Download,
  KeyRound,
  Link2,
  Search,
  Table2,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import { GraphView } from "./graph-view";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { DB_KIND_MAP } from "@/lib/db-kinds";
import { cn } from "@/lib/cn";
import type { Cell, DbKindId, Row, TableMeta } from "@/lib/types";

function cellText(v: Cell): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export function RecordsView({
  kind,
  meta,
  label,
}: {
  kind: DbKindId;
  meta: TableMeta;
  label: string;
}) {
  const [view, setView] = useState<"table" | "graph">("table");
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibility, setVisibility] = useState<VisibilityState>({});

  const kindMeta = DB_KIND_MAP[kind];

  const columns = useMemo<ColumnDef<Row>[]>(
    () =>
      meta.columns.map((col) => ({
        accessorKey: col.name,
        header: col.name,
        cell: (info) => renderCell(info.getValue() as Cell, col.type),
        meta: col,
      })),
    [meta],
  );

  const table = useReactTable({
    data: meta.rows,
    columns,
    state: { sorting, globalFilter: filter, columnVisibility: visibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    onColumnVisibilityChange: setVisibility,
    globalFilterFn: (row, _id, value) =>
      Object.values(row.original).some((v) =>
        cellText(v as Cell).toLowerCase().includes(String(value).toLowerCase()),
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const visibleRows = table.getRowModel().rows.map((r) => r.original);

  function exportAs(kind: "json" | "csv") {
    const rows = visibleRows;
    let blob: Blob;
    if (kind === "json") {
      blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    } else {
      const cols = meta.columns.map((c) => c.name);
      const head = cols.join(",");
      const body = rows
        .map((r) =>
          cols
            .map((c) => {
              const t = cellText(r[c]);
              return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
            })
            .join(","),
        )
        .join("\n");
      blob = new Blob([`${head}\n${body}`], { type: "text/csv" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.name}.${kind}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} rows as ${kind.toUpperCase()}`);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ color: kindMeta.color }}>
            <Table2 className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <h1 className="font-mono text-sm font-semibold text-foreground">{meta.name}</h1>
            <p className="text-[0.7rem] text-faint">{label}</p>
          </div>
          <Badge className="ml-1">{meta.rowCount} rows</Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter rows…"
              className="h-9 w-44 rounded-lg border border-border bg-surface-2 pl-8 pr-3 text-sm text-foreground placeholder:text-faint outline-none transition-colors focus:border-accent/50 focus:bg-surface"
            />
          </div>

          <Popover
            button={
              <ToolbarButton>
                <Columns3 className="h-4 w-4" />
                Columns
              </ToolbarButton>
            }
          >
            <div className="w-48 p-1.5">
              {table.getAllLeafColumns().map((col) => (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="accent-[var(--accent)]"
                  />
                  <span className="truncate font-mono text-[0.8rem]">{col.id}</span>
                </label>
              ))}
            </div>
          </Popover>

          <Popover
            button={
              <ToolbarButton>
                <Download className="h-4 w-4" />
                Export
              </ToolbarButton>
            }
          >
            <div className="w-36 p-1.5">
              <MenuItem onClick={() => exportAs("json")}>as JSON</MenuItem>
              <MenuItem onClick={() => exportAs("csv")}>as CSV</MenuItem>
            </div>
          </Popover>

          <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
            <SegBtn active={view === "table"} onClick={() => setView("table")}>
              <Table2 className="h-3.5 w-3.5" />
              Table
            </SegBtn>
            <SegBtn active={view === "graph"} onClick={() => setView("graph")}>
              <Workflow className="h-3.5 w-3.5" />
              Graph
            </SegBtn>
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-surface-2">
                  <th className="w-10 border-b border-border px-3 py-2 text-left text-[0.7rem] font-medium text-faint">
                    #
                  </th>
                  {hg.headers.map((header) => {
                    const col = header.column.columnDef.meta as
                      | TableMeta["columns"][number]
                      | undefined;
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="border-b border-border px-3 py-2 text-left font-medium"
                      >
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="group inline-flex items-center gap-1.5 text-foreground"
                        >
                          {col?.primaryKey && <KeyRound className="h-3 w-3 text-accent" />}
                          {col?.foreignKey && <Link2 className="h-3 w-3 text-faint" />}
                          <span className="font-mono text-[0.78rem]">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-accent" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-accent" />
                          ) : (
                            <ArrowDownUp className="h-3 w-3 text-faint opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                        <span className="ml-1.5 text-[0.62rem] uppercase text-faint">
                          {col?.type}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className="group hover:bg-surface-2/60">
                  <td className="border-b border-border px-3 py-2 font-mono text-[0.72rem] text-faint">
                    {i + 1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-border px-3 py-2 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={meta.columns.length + 1}
                    className="px-3 py-10 text-center text-sm text-faint"
                  >
                    No rows match “{filter}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <GraphView kind={kind} meta={meta} rows={visibleRows} />
      )}
    </div>
  );
}

function renderCell(value: Cell, type: string) {
  if (value === null)
    return <span className="font-mono text-[0.78rem] italic text-faint">null</span>;
  if (typeof value === "boolean")
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.72rem] font-medium",
          value ? "bg-accent-soft text-accent" : "bg-surface-3 text-muted",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {value ? "true" : "false"}
      </span>
    );
  if (type === "int" || type === "numeric")
    return <span className="font-mono text-[0.8rem] tabular-nums text-foreground">{String(value)}</span>;
  if (type === "timestamp" || type === "uuid" || type === "json")
    return <span className="font-mono text-[0.78rem] text-muted">{String(value)}</span>;
  return <span className="text-foreground">{String(value)}</span>;
}

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-sm text-muted transition-colors hover:text-foreground hover:bg-surface-3">
      {children}
    </span>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[0.8rem] font-medium transition-colors",
        active ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-surface-2"
    >
      {children}
    </button>
  );
}
