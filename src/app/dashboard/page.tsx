import Link from "next/link";

import { CategoryChart } from "@/components/dashboard/category-chart";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { linesOfCodeFromText } from "@/lib/activity";

const CATEGORY_ORDER = [
  "Memory",
  "Semantics",
  "Type System",
  "Templates",
  "Concurrency",
  "Modern STL & Features",
  "Optimization",
] as const;

export default async function DashboardPage() {
  const [nodes, projects] = await Promise.all([
    prisma.roadmapNode.findMany({ orderBy: { id: "asc" } }),
    prisma.project.findMany({ include: { tasks: true }, orderBy: { id: "asc" } }),
  ]);

  const categoryStats = CATEGORY_ORDER.map((category) => {
    const scoped = nodes.filter((node) => node.category === category);
    const mastered = scoped.filter((node) => node.status === "MASTERED").length;
    return { category, mastered, total: scoped.length };
  });

  const totalMastered = nodes.filter((node) => node.status === "MASTERED").length;
  const weaknessConcepts = nodes.filter((node) => node.status === "PENDING").slice(0, 6);
  const weaknessProjects = projects.filter((project) => !project.finalCode).slice(0, 3);

  const nodeCodeLines = nodes.reduce(
    (sum, node) => sum + linesOfCodeFromText(node.userCode),
    0,
  );
  const projectCodeLines = projects.reduce(
    (sum, project) => sum + linesOfCodeFromText(project.finalCode),
    0,
  );

  const totalLinesOfCode = nodeCodeLines + projectCodeLines;

  return (
    <section className="space-y-10 pb-16">
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 shadow-[0_45px_120px_rgba(15,23,42,0.8)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Telemetry</p>
            <h1 className="text-4xl font-semibold text-white">Gap Analysis Dashboard</h1>
            <p className="max-w-2xl text-base text-slate-300">
              Visualize mastery per discipline, surface blind spots, and quantify how much code
              you&apos;ve shipped across the roadmap.
            </p>
          </div>
          <Button asChild variant="glass" className="gap-2">
            <Link href="/">Back to Roadmap</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Concepts Mastered" value={totalMastered} />
        <StatCard label="Projects with Artefacts" value={projects.filter((p) => p.finalCode).length} />
        <StatCard label="Lines of C++ Logged" value={totalLinesOfCode} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_35px_100px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Completion by Category
            </p>
            <h2 className="text-2xl font-semibold text-white">Discipline heatmap</h2>
          </div>
        </div>
        <div className="mt-6">
          <CategoryChart data={categoryStats} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Weakness Spotter</h3>
            <BadgePulse label="Recommended Focus" />
          </div>
          <div className="space-y-3">
            {weaknessConcepts.map((node) => (
              <FocusRow
                key={node.id}
                title={node.title}
                subtitle={node.category}
                href={`/?focus=${node.id}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Project Follow Ups</h3>
            <BadgePulse label="Ship Artefacts" />
          </div>
          <div className="space-y-3">
            {weaknessProjects.map((project) => (
              <FocusRow
                key={project.id}
                title={project.title}
                subtitle="No final C++ artefact yet"
                href={`/projects/${project.id}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-cyan-200">{value}</p>
    </div>
  );
}

function BadgePulse({ label }: { label: string }) {
  return (
    <span className="animate-pulse rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
      {label}
    </span>
  );
}

function FocusRow({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-100"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{subtitle}</p>
      </div>
      <span className="text-xs font-semibold text-cyan-200">Start</span>
    </Link>
  );
}

