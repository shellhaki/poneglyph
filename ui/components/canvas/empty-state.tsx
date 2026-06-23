"use client";

import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DB_KINDS } from "@/lib/db-kinds";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex w-fit items-center gap-2">
          {DB_KINDS.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.span
                key={k.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface"
                style={{ color: k.color }}
              >
                <Icon className="h-5 w-5" />
              </motion.span>
            );
          })}
        </div>

        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          No sources yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Connect a database to start browsing. Everything you add is stored
          locally in this browser — no account needed.
        </p>
        <Button className="mt-6" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add your first source
        </Button>
      </motion.div>
    </div>
  );
}
