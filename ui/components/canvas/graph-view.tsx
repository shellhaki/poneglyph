"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import { RecordNode, type RecordNodeData } from "./record-node";
import { tableMeta } from "@/lib/mock-data";
import type { DbKindId, Row, TableMeta } from "@/lib/types";

const nodeTypes = { record: RecordNode };

function fieldsOf(meta: TableMeta, row: Row, limit = 4): [string, string][] {
  return meta.columns
    .filter((c) => c.name !== meta.primaryKey)
    .slice(0, limit)
    .map((c) => [c.name, format(row[c.name])]);
}

function format(v: Row[string]): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export function GraphView({
  kind,
  meta,
  rows,
}: {
  kind: DbKindId;
  meta: TableMeta;
  rows: Row[];
}) {
  const computed = useMemo(() => {
    const fkCol = meta.columns.find((c) => c.foreignKey);
    const parentMeta = fkCol?.foreignKey
      ? tableMeta(kind, fkCol.foreignKey.table)
      : undefined;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (fkCol?.foreignKey && parentMeta) {
      const refCol = fkCol.foreignKey.column;
      const usedKeys = new Set(rows.map((r) => String(r[fkCol.name])));
      const parents = parentMeta.rows.filter((p) =>
        usedKeys.has(String(p[refCol])),
      );

      parents.forEach((p, i) => {
        const id = `p-${p[refCol]}`;
        nodes.push({
          id,
          type: "record",
          position: { x: 0, y: i * 150 },
          data: {
            title: `${parentMeta.name} · ${p[refCol]}`,
            accent: true,
            hasSource: true,
            fields: fieldsOf(parentMeta, p, 3),
          } satisfies RecordNodeData,
          draggable: true,
        });
      });

      rows.forEach((r, i) => {
        const id = `c-${r[meta.primaryKey]}`;
        nodes.push({
          id,
          type: "record",
          position: { x: 360, y: i * 132 },
          data: {
            title: `${meta.name} · ${r[meta.primaryKey]}`,
            subtitle: `→ ${fkCol.name}`,
            hasTarget: true,
            fields: fieldsOf(meta, r, 4),
          } satisfies RecordNodeData,
          draggable: true,
        });
        edges.push({
          id: `e-${id}`,
          source: `p-${r[fkCol.name]}`,
          target: id,
          animated: true,
          style: { stroke: "var(--accent)", strokeWidth: 1.4 },
        });
      });
    } else {
      nodes.push({
        id: "root",
        type: "record",
        position: { x: 0, y: Math.max(0, (rows.length - 1) * 66) },
        data: {
          title: meta.name,
          subtitle: `${rows.length} rows`,
          accent: true,
          hasSource: true,
          fields: meta.columns.slice(0, 4).map((c) => [c.name, c.type]),
        } satisfies RecordNodeData,
        draggable: true,
      });
      rows.forEach((r, i) => {
        const id = `r-${r[meta.primaryKey] ?? i}`;
        nodes.push({
          id,
          type: "record",
          position: { x: 340, y: i * 132 },
          data: {
            title: `${meta.primaryKey}: ${r[meta.primaryKey]}`,
            hasTarget: true,
            fields: fieldsOf(meta, r, 4),
          } satisfies RecordNodeData,
          draggable: true,
        });
        edges.push({
          id: `e-${id}`,
          source: "root",
          target: id,
          style: { stroke: "var(--border-strong)", strokeWidth: 1.3 },
        });
      });
    }

    return { nodes, edges };
  }, [kind, meta, rows]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computed.edges);

  useEffect(() => {
    setNodes(computed.nodes);
    setEdges(computed.edges);
  }, [computed, setNodes, setEdges]);

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--border-strong)" />
        <Controls
          showInteractive={false}
          className="!border !border-border !bg-surface !shadow-lg [&_button]:!border-border [&_button]:!bg-surface [&_button]:!text-foreground [&_button:hover]:!bg-surface-2"
        />
      </ReactFlow>
    </div>
  );
}
