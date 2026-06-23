"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";

type MiniData = {
  title: string;
  rows: [string, string][];
  accent?: boolean;
};

function MiniNode({ data }: NodeProps) {
  const d = data as MiniData;
  return (
    <div
      className={
        "w-[178px] overflow-hidden rounded-xl border bg-surface shadow-lg " +
        (d.accent ? "border-accent/40" : "border-border")
      }
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-faint" />
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-faint" />
      <div
        className={
          "flex items-center gap-1.5 px-3 py-2 text-[0.72rem] font-semibold " +
          (d.accent ? "bg-accent-soft text-accent" : "bg-surface-2 text-foreground")
        }
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        {d.title}
      </div>
      <div className="divide-y divide-border">
        {d.rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-3 py-1.5 text-[0.68rem]">
            <span className="text-faint">{k}</span>
            <span className="font-mono text-muted">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = { mini: MiniNode };

export function HeroGraph() {
  const nodes = useMemo<Node[]>(
    () => [
      {
        id: "owners",
        type: "mini",
        position: { x: 0, y: 70 },
        data: {
          title: "owners",
          accent: true,
          rows: [
            ["owner_id", "3"],
            ["name", "Nico Robin"],
            ["city", "Ohara"],
          ],
        },
        draggable: false,
      },
      {
        id: "pets",
        type: "mini",
        position: { x: 250, y: 0 },
        data: {
          title: "pets",
          rows: [
            ["pet_id", "4"],
            ["name", "Max"],
            ["species", "Dog"],
          ],
        },
        draggable: false,
      },
      {
        id: "appts",
        type: "mini",
        position: { x: 250, y: 165 },
        data: {
          title: "appointments",
          rows: [
            ["pet_id", "4"],
            ["desc", "Check-up"],
            ["paid", "true"],
          ],
        },
        draggable: false,
      },
    ],
    [],
  );

  const edges = useMemo<Edge[]>(
    () => [
      {
        id: "e1",
        source: "owners",
        target: "pets",
        animated: true,
        style: { stroke: "var(--accent)", strokeWidth: 1.5 },
      },
      {
        id: "e2",
        source: "pets",
        target: "appts",
        animated: true,
        style: { stroke: "var(--border-strong)", strokeWidth: 1.5 },
      },
    ],
    [],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
