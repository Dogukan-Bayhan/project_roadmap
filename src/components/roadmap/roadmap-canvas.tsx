"use client";

import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { useCallback, useMemo, useState, useTransition } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RoadmapNodeDTO } from "@/types/roadmap";

type RoadmapCanvasProps = {
  nodes: RoadmapNodeDTO[];
};

const CATEGORY_ORDER: RoadmapNodeDTO["category"][] = [
  "Memory",
  "Semantics",
  "Type System",
  "Templates",
  "Concurrency",
  "Modern STL & Features",
  "Optimization",
];

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "MASTERED"] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const STATUS_META: Record<
  StatusOption,
  { label: string; color: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-slate-300",
    border: "rgba(148,163,184,0.9)",
  },
  IN_PROGRESS: {
    label: "Building",
    color: "text-amber-300",
    border: "rgba(251,191,36,0.8)",
  },
  MASTERED: {
    label: "Mastered",
    color: "text-emerald-300",
    border: "rgba(52,211,153,0.9)",
  },
};

const CATEGORY_GRADIENT: Record<RoadmapNodeDTO["category"], string> = {
  Memory: "from-cyan-500/40 to-blue-500/10",
  Semantics: "from-purple-500/40 to-indigo-500/10",
  "Type System": "from-emerald-400/40 to-cyan-500/10",
  Templates: "from-amber-500/40 to-orange-500/10",
  Concurrency: "from-rose-500/40 to-pink-500/10",
  "Modern STL & Features": "from-blue-500/40 to-violet-500/10",
  Optimization: "from-lime-500/40 to-emerald-500/10",
};

type FlowGraph = {
  nodes: Node[];
  edges: Edge[];
};

const computeFlowGraph = (nodes: RoadmapNodeDTO[]): FlowGraph => {
  const spacingX = 260;
  const spacingY = 140;
  const categoryDepth = new Map<string, number>();
  const categoryIndex = new Map(
    CATEGORY_ORDER.map((category, index) => [category, index]),
  );

const resolveStatus = (value: string): StatusOption => {
  return STATUS_OPTIONS.includes(value as StatusOption)
    ? (value as StatusOption)
    : "PENDING";
};

const flowNodes: Node[] = nodes.map((node) => {
    const order = categoryDepth.get(node.category) ?? 0;
    const x =
      (categoryIndex.get(node.category) ?? CATEGORY_ORDER.length) * spacingX;
    const y = order * spacingY;
    categoryDepth.set(node.category, order + 1);

    const statusKey = resolveStatus(node.status);
    const status = STATUS_META[statusKey] ?? STATUS_META.PENDING;

    return {
      id: node.id.toString(),
      data: {
        label: node.title,
        category: node.category,
        status: statusKey,
      },
      position: { x, y },
      style: {
        borderRadius: 24,
        padding: 16,
        color: "#e2e8f0",
        fontSize: 14,
        backdropFilter: "blur(12px)",
        background: "rgba(15,23,42,0.85)",
        border: `1px solid ${status.border}`,
        boxShadow: `0 20px 55px rgba(8,47,73,0.35)`,
      },
      sourcePosition: "right",
      targetPosition: "left",
      className: cn(
        "transition-all duration-300 hover:shadow-[0_25px_70px_rgba(34,211,238,0.25)]",
      ),
    };
  });

  const flowEdges: Edge[] = nodes
    .filter((node) => node.parentId)
    .map((node) => {
      const status = STATUS_META[resolveStatus(node.status)];
      return {
        id: `edge-${node.parentId}-${node.id}`,
        source: node.parentId!.toString(),
        target: node.id.toString(),
        animated: node.status === "MASTERED",
        style: {
          stroke: status.border,
          strokeWidth: 2,
        },
      };
    });

  return { nodes: flowNodes, edges: flowEdges };
};

export function RoadmapCanvas({ nodes }: RoadmapCanvasProps) {
  const initialGraph = useMemo(() => computeFlowGraph(nodes), [nodes]);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    initialGraph.nodes,
  );
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(
    initialGraph.edges,
  );
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeDTO | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<StatusOption>("PENDING");
  const [isPending, startTransition] = useTransition();

  const openDrawer = useCallback(
    (nodeId: string) => {
      const found = nodes.find((node) => node.id.toString() === nodeId);
      if (!found) return;
      setSelectedNode(found);
      setNotes(found.userCode ?? "");
      setStatus(resolveStatus(found.status));
    },
    [nodes],
  );

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node) => {
      openDrawer(node.id);
    },
    [openDrawer],
  );

  const updateLocalNode = useCallback(
    (nodeId: number, nextStatus: StatusOption, code: string) => {
      setFlowNodes((current) =>
        current.map((flowNode) => {
          if (flowNode.id !== nodeId.toString()) {
            return flowNode;
          }
          const statusMeta = STATUS_META[nextStatus];
          return {
            ...flowNode,
            data: { ...flowNode.data, status: nextStatus },
            style: {
              ...flowNode.style,
              border: `1px solid ${statusMeta.border}`,
            },
          };
        }),
      );
      setFlowEdges((current) =>
        current.map((edge) => {
          if (edge.target !== nodeId.toString()) {
            return edge;
          }
          return {
            ...edge,
            animated: nextStatus === "MASTERED",
            style: {
              ...(edge.style ?? {}),
              stroke: STATUS_META[nextStatus].border,
            },
          };
        }),
      );
      setSelectedNode((prev) =>
        prev ? { ...prev, status: nextStatus, userCode: code } : prev,
      );
    },
    [setFlowEdges, setFlowNodes],
  );

  const saveProgress = useCallback(() => {
    if (!selectedNode) return;
    startTransition(async () => {
      const response = await fetch(`/api/roadmap/${selectedNode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          userCode: notes,
        }),
      });

      if (!response.ok) {
        console.error("Failed to persist roadmap node");
        return;
      }

      updateLocalNode(selectedNode.id, status, notes);
    });
  }, [notes, selectedNode, status, updateLocalNode]);

  const resetProgress = useCallback(() => {
    if (!selectedNode) return;
    setStatus("PENDING");
    setNotes("");
    startTransition(async () => {
      const response = await fetch(`/api/roadmap/${selectedNode.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING",
          userCode: "",
        }),
      });

      if (!response.ok) {
        console.error("Failed to reset roadmap node");
        return;
      }

      updateLocalNode(selectedNode.id, "PENDING", "");
    });
  }, [selectedNode, updateLocalNode]);

  return (
    <ReactFlowProvider>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="h-[640px] overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950 shadow-[0_25px_80px_rgba(8,47,73,0.65)]">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            panOnScroll
            panOnDrag
          >
            <Background
              color="rgba(15,118,110,0.25)"
              gap={32}
              size={1.5}
              variant="cross"
            />
            <Controls className="!bg-slate-900/80 !border-white/10 !text-slate-200" />
            <MiniMap
              className="!bg-slate-900/70"
              nodeStrokeColor={(node) =>
                STATUS_META[
                  (node.data.status as keyof typeof STATUS_META) ?? "PENDING"
                ]?.border ?? "#94a3b8"
              }
              nodeColor={(node) =>
                CATEGORY_GRADIENT[
                  node.data.category as RoadmapNodeDTO["category"]
                ]
                  ? "rgba(15,23,42,0.9)"
                  : "#0f172a"
              }
            />
          </ReactFlow>
        </div>
      </motion.div>

      <Dialog
        open={Boolean(selectedNode)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNode(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-3">
              <span>{selectedNode?.title}</span>
              {selectedNode ? (
                <Badge variant="default" className="self-start">
                  {selectedNode.category}
                </Badge>
              ) : null}
            </DialogTitle>
            <DialogDescription>
              Attach your implementation notes or code experiments for this
              concept. Everything saves locally to your SQLite db.
            </DialogDescription>
          </DialogHeader>

          {selectedNode ? (
            <div className="flex flex-col gap-6">
              <div>
                <Label className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Status
                </Label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      variant={option === status ? "glass" : "outline"}
                      size="sm"
                      className={cn(
                        option === status && "ring-1 ring-cyan-300/60",
                      )}
                      onClick={() => setStatus(option)}
                    >
                      {STATUS_META[option].label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-notes">C++ code or notes</Label>
                <Textarea
                  id="node-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="// Drop your snippets for this concept here"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={saveProgress}
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending ? "Saving..." : "Save Progress"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetProgress}
                  disabled={isPending}
                >
                  Reset
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </ReactFlowProvider>
  );
}

