import { ArrowLeftRight, Workflow } from "lucide-react";
import Link from "next/link";

import { ProjectsBoard } from "@/components/projects/projects-board";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import type { ProjectDTO } from "@/types/projects";

const parseList = (value: unknown): string[] => {
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

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" },
    include: {
      tasks: {
        orderBy: { id: "asc" },
      },
    },
  });

  const payload: ProjectDTO[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    implementationSteps: parseList(project.implementationSteps),
    learningOutcomes: project.learningOutcomes,
    techStack: parseList(project.techStack),
    finalCode: project.finalCode,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      description: task.description,
      isCompleted: task.isCompleted,
      projectId: task.projectId,
    })),
  }));

  return (
    <section className="space-y-10 pb-12">
      <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-10 shadow-[0_45px_120px_rgba(15,23,42,0.8)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-100">
              <Workflow className="h-4 w-4" />
              Quant Portfolio
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Quant Developer Projects
              </h1>
              <p className="max-w-2xl text-base text-slate-300">
                Track the exact C++ builds that prove your readiness for order
                routing, feed handling, and pricing stacks. Each project ships
                with a curated checklist plus a code vault to store the final
                artefact.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="gap-2 text-slate-200">
            <Link href="/">
              Back to Roadmap <ArrowLeftRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <ProjectsBoard projects={payload} />
    </section>
  );
}

