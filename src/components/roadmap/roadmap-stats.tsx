"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import type { RoadmapNodeDTO } from "@/types/roadmap";

type RoadmapStatsProps = {
  nodes: RoadmapNodeDTO[];
};

export function RoadmapStats({ nodes }: RoadmapStatsProps) {
  const totals = nodes.reduce(
    (acc, node) => {
      acc.total += 1;
      if (node.status === "MASTERED") acc.mastered += 1;
      else if (node.status === "IN_PROGRESS") acc.inProgress += 1;
      else acc.pending += 1;
      return acc;
    },
    { total: 0, mastered: 0, inProgress: 0, pending: 0 },
  );

  const completion =
    totals.total === 0 ? 0 : Math.round((totals.mastered / totals.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-2xl md:grid-cols-4"
    >
      <div className="md:col-span-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Mastery Score
        </p>
        <div className="mt-4 flex items-end gap-4">
          <span className="text-5xl font-semibold text-cyan-200">
            {completion}%
          </span>
          <Badge variant="default">{nodes.length} Concepts</Badge>
        </div>
        <div className="mt-6 h-2 rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <StatBlock
        label="Active Builds"
        value={totals.inProgress}
        accent="from-amber-400 to-rose-500"
      />
      <StatBlock
        label="Shipped Concepts"
        value={totals.mastered}
        accent="from-emerald-400 to-cyan-400"
      />
    </motion.div>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.1)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${accent}`} />
    </div>
  );
}

