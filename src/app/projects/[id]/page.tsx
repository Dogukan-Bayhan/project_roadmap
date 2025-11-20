import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/projects/project-detail";
import prisma from "@/lib/prisma";
import type { ProjectDTO } from "@/types/projects";

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

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectId = Number(params.id);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const payload: ProjectDTO = {
    id: project.id,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    learningOutcomes: project.learningOutcomes,
    implementationSteps: parseSteps(project.implementationSteps),
    finalCode: project.finalCode,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      description: task.description,
      isCompleted: task.isCompleted,
      projectId: task.projectId,
    })),
  };

  return (
    <section className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to portfolio
        </Link>
        <span className="text-sm text-slate-400">
          Project #{payload.id.toString().padStart(2, "0")}
        </span>
      </div>

      <ProjectDetail project={payload} />
    </section>
  );
}

