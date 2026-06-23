"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";

export interface RecordNodeData {
  title: string;
  subtitle?: string;
  fields: [string, string][];
  accent?: boolean;
  hasTarget?: boolean;
  hasSource?: boolean;
  [key: string]: unknown;
}

export function RecordNode({ data }: NodeProps) {
  const d = data as RecordNodeData;
  return (
    <div
      className={cn(
        "w-[210px] overflow-hidden rounded-xl border bg-surface shadow-lg",
        d.accent ? "border-accent/45" : "border-border",
      )}
    >
      {d.hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2 !w-2 !border-0 !bg-accent"
        />
      )}
      {d.hasSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2 !w-2 !border-0 !bg-faint"
        />
      )}
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2",
          d.accent ? "bg-accent-soft" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "truncate font-mono text-[0.74rem] font-semibold",
            d.accent ? "text-accent" : "text-foreground",
          )}
        >
          {d.title}
        </span>
        {d.subtitle && (
          <span className="shrink-0 text-[0.66rem] text-faint">{d.subtitle}</span>
        )}
      </div>
      <div className="divide-y divide-border">
        {d.fields.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between gap-3 px-3 py-1.5"
          >
            <span className="shrink-0 text-[0.7rem] text-faint">{k}</span>
            <span className="truncate font-mono text-[0.7rem] text-muted">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
