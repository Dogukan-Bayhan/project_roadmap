import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { RoadmapCanvas } from "@/components/roadmap/roadmap-canvas";
import { RoadmapStats } from "@/components/roadmap/roadmap-stats";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import type { RoadmapNodeDTO } from "@/types/roadmap";

const parseSteps = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value as string[];
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default async function Home() {
  const nodes = await prisma.roadmapNode.findMany({
    orderBy: { id: "asc" },
  });

  const roadmapNodes: RoadmapNodeDTO[] = nodes.map(
    ({
      id,
      title,
      category,
      parentId,
      status,
      userCode,
      longDescription,
      implementationSteps,
      learningOutcomes,
    }) => ({
      id,
      title,
      category,
      parentId,
      status,
      userCode,
      longDescription,
      implementationSteps: parseSteps(implementationSteps),
      learningOutcomes,
    }),
  );

  return (
    <section className="space-y-10 pb-12">
      <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 shadow-[0_45px_120px_rgba(15,23,42,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(147,51,234,0.25),_transparent_65%)]" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Quant Route
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                C++ Quant Mastery Tracker
              </h1>
              <p className="max-w-2xl text-base text-slate-300">
                Visualize every modern C++ concept you need for high-frequency
                trading systems, attach code artifacts per node, and keep your
                quant project portfolio in one dark-mode cockpit.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/projects">
                  Explore Quant Projects <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-slate-200">
                Download Progress Snapshot
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-right text-sm text-slate-200 backdrop-blur-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Live Telemetry
            </p>
            <p className="mt-6 text-5xl font-semibold text-cyan-200">
              {roadmapNodes.filter((node) => node.status === "MASTERED").length}
            </p>
            <p className="text-sm text-slate-400">concepts mastered</p>
          </div>
        </div>
      </div>

      <RoadmapStats nodes={roadmapNodes} />
      <RoadmapCanvas nodes={roadmapNodes} />
    </section>
  );
}
