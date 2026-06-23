"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Table2, Trash2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { DB_KIND_MAP } from "@/lib/db-kinds";
import { cn } from "@/lib/cn";
import type { Session } from "@/lib/types";

export interface Selection {
  sessionId: string;
  table: string;
}

export function Sidebar({
  sessions,
  selected,
  onSelect,
  onAdd,
  onRemove,
}: {
  sessions: Session[];
  selected: Selection | null;
  onSelect: (sel: Selection) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-3 pb-3">
        <Button variant="secondary" size="sm" className="w-full" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add source
        </Button>
      </div>

      <div className="flex items-center justify-between px-4 pb-1.5 pt-2">
        <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">
          Sources
        </span>
        <span className="font-mono text-[0.7rem] text-faint">{sessions.length}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.map((s) => {
          const meta = DB_KIND_MAP[s.kind];
          const Icon = meta.icon;
          const isOpen = !collapsed.has(s.id);
          return (
            <div key={s.id} className="mb-0.5">
              <div
                className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-surface-2"
              >
                <button
                  onClick={() => toggle(s.id)}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-faint transition-transform",
                      isOpen && "rotate-90",
                    )}
                  />
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                    style={{ color: meta.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {s.label}
                  </span>
                </button>
                <button
                  onClick={() => onRemove(s.id)}
                  className="shrink-0 rounded p-1 text-faint opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  aria-label="Remove source"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isOpen && (
                <div className="ml-3.5 border-l border-border pl-2.5">
                  {s.tables.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-faint">No tables synced</p>
                  )}
                  {s.tables.map((t) => {
                    const active =
                      selected?.sessionId === s.id && selected.table === t;
                    return (
                      <button
                        key={t}
                        onClick={() => onSelect({ sessionId: s.id, table: t })}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.82rem] transition-colors",
                          active
                            ? "bg-accent-soft font-medium text-accent"
                            : "text-muted hover:bg-surface-2 hover:text-foreground",
                        )}
                      >
                        <Table2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate font-mono">{t}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="font-mono text-[0.68rem] leading-relaxed text-faint">
          sessions saved locally
          <br />
          <span className="text-accent">●</span> nothing leaves this browser
        </p>
      </div>
    </aside>
  );
}
