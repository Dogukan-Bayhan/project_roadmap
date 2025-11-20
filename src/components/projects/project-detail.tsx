"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Code, ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectDTO, ProjectTaskDTO } from "@/types/projects";

type ProjectDetailProps = {
  project: ProjectDTO;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [catalog, setCatalog] = useState(project);
  const [codeDraft, setCodeDraft] = useState(project.finalCode ?? "");
  const [isPending, startTransition] = useTransition();
  const [stateMeta, setStateMeta] = useState<{ type: "code" | "task" | "complete" | null; taskId?: number }>({
    type: null,
  });

  const completedTasks = catalog.tasks.filter((task) => task.isCompleted).length;

  const updateCatalogTask = (taskId: number, isCompleted: boolean) => {
    setCatalog((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted } : task,
      ),
    }));
  };

  const persistTask = async (task: ProjectTaskDTO, isCompleted: boolean) => {
    setStateMeta({ type: "task", taskId: task.id });
    startTransition(async () => {
      updateCatalogTask(task.id, isCompleted);

      const response = await fetch(`/api/projects/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        console.error("Failed to update project task");
        updateCatalogTask(task.id, !isCompleted);
      }

      setStateMeta({ type: null });
    });
  };

  const persistCode = async () => {
    setStateMeta({ type: "code" });
    startTransition(async () => {
      const response = await fetch(`/api/projects/${catalog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalCode: codeDraft }),
      });

      if (!response.ok) {
        console.error("Failed to store project code");
        setStateMeta({ type: null });
        return;
      }

      setCatalog((previous) => ({
        ...previous,
        finalCode: codeDraft,
      }));
      setStateMeta({ type: null });
    });
  };

  const completeProject = async () => {
    setStateMeta({ type: "complete" });
    startTransition(async () => {
      const response = await fetch(`/api/projects/${catalog.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalCode: codeDraft }),
      });

      if (!response.ok) {
        console.error("Failed to mark project complete");
        setStateMeta({ type: null });
        return;
      }

      const payload = await response.json();
      setCatalog((previous) => ({
        ...previous,
        finalCode: payload.finalCode ?? previous.finalCode,
        tasks: previous.tasks.map((task) => ({ ...task, isCompleted: true })),
      }));
      setStateMeta({ type: null });
    });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6 rounded-[36px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_45px_120px_rgba(15,23,42,0.55)]">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default" className="bg-cyan-500/20 text-cyan-100">
            {completedTasks}/{catalog.tasks.length} milestones
          </Badge>
          {catalog.techStack.map((stack) => (
            <Badge key={stack} variant="default" className="bg-slate-800/70 text-slate-100">
              {stack}
            </Badge>
          ))}
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-white">{catalog.title}</h1>
          <p className="text-base text-slate-300">{catalog.description}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-8">
          <DocSection title="Overview" body={catalog.longDescription} />
          <DocSection title="Real-World Quant Application" body={catalog.learningOutcomes} />
          <DocSection title="Step-by-Step Implementation Guide" list={catalog.implementationSteps} />

          <Card className="border-white/10 bg-slate-950/60">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-2xl bg-slate-900/60 p-3">
                <ListTodo className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Execution Checklist</CardTitle>
                <p className="text-sm text-slate-400">
                  Toggle milestones as you implement and benchmark the build.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {catalog.tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4 text-sm text-slate-200"
                >
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={(checked) => persistTask(task, Boolean(checked))}
                    disabled={isPending && stateMeta.type === "task" && stateMeta.taskId === task.id}
                  />
                  <span>{task.description}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">The Lab</p>
              <h3 className="text-2xl font-semibold text-white">Implementation journal</h3>
            </div>
            {catalog.finalCode ? (
              <Badge variant="default" className="bg-emerald-500/20 text-emerald-100">
                Archived
              </Badge>
            ) : null}
          </div>
          <Label htmlFor="project-code" className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Artefact
          </Label>
          <Textarea
            id="project-code"
            className="min-h-[420px] rounded-2xl border border-white/10 bg-slate-950 font-mono text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] focus-visible:border-cyan-300"
            placeholder="// Drop the final C++ translation unit for this project."
            value={codeDraft}
            onChange={(event) => setCodeDraft(event.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button
              className="flex-1 gap-2"
              onClick={persistCode}
              disabled={isPending && stateMeta.type === "code"}
            >
              {isPending && stateMeta.type === "code" ? "Archiving..." : "Save Artefact"}
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setCodeDraft(catalog.finalCode ?? "")}>
              Revert
            </Button>
          </div>
          <Button
            variant="glass"
            className="w-full gap-2"
            onClick={completeProject}
            disabled={isPending && stateMeta.type === "complete"}
          >
            {isPending && stateMeta.type === "complete" ? "Marking..." : "Complete Project"}
            <BadgeCheck className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type DocSectionProps = {
  title: string;
  body?: string;
  list?: string[];
};

function DocSection({ title, body, list }: DocSectionProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{title}</p>
      {body ? <p className="text-base leading-relaxed text-slate-200">{body}</p> : null}
      {list ? (
        <ul className="list-decimal space-y-3 pl-6 text-sm text-slate-300">
          {list.map((entry, index) => (
            <li key={`${title}-${index}`}>{entry}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

