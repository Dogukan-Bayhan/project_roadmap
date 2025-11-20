"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import { Code, ListTodo, NotebookPen, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectDTO, ProjectTaskDTO } from "@/types/projects";

type ProjectsBoardProps = {
  projects: ProjectDTO[];
};

type SavingState = {
  type: "code" | "task" | null;
  taskId?: number;
};

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  const [catalog, setCatalog] = useState(projects);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [codeDraft, setCodeDraft] = useState("");
  const [isTransitionPending, startTransition] = useTransition();
  const [stateMeta, setStateMeta] = useState<SavingState>({ type: null });

  const activeProject = useMemo(
    () => catalog.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, catalog],
  );

  const openProject = (projectId: number) => {
    const project = catalog.find((item) => item.id === projectId);
    if (!project) return;
    setActiveProjectId(projectId);
    setCodeDraft(project.finalCode ?? "");
  };

  const closeProject = () => {
    setActiveProjectId(null);
    setCodeDraft("");
    setStateMeta({ type: null });
  };

  const updateCatalogTask = (taskId: number, isCompleted: boolean) => {
    setCatalog((previous) =>
      previous.map((project) => ({
        ...project,
        tasks: project.tasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted } : task,
        ),
      })),
    );
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
    if (!activeProject) return;
    setStateMeta({ type: "code" });
    startTransition(async () => {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalCode: codeDraft }),
      });

      if (!response.ok) {
        console.error("Failed to store project code");
        setStateMeta({ type: null });
        return;
      }

      setCatalog((previous) =>
        previous.map((project) =>
          project.id === activeProject.id
            ? { ...project, finalCode: codeDraft }
            : project,
        ),
      );
      setStateMeta({ type: null });
    });
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {catalog.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Card className="h-full border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-2xl text-white">
                  {project.title}
                  <Badge variant="default">
                    {project.tasks.filter((task) => task.isCompleted).length}/
                    {project.tasks.length} Done
                  </Badge>
                </CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <ListTodo className="h-10 w-10 rounded-2xl bg-slate-800/60 p-2 text-cyan-300" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Checklist
                    </p>
                    <p>
                      {project.tasks.filter((task) => task.isCompleted).length}{" "}
                      of {project.tasks.length} milestones verified
                    </p>
                  </div>
                </div>
                <Button
                  variant="glass"
                  className="w-full gap-2"
                  onClick={() => openProject(project.id)}
                >
                  Open build console <Rocket className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={Boolean(activeProject)} onOpenChange={(open) => !open && closeProject()}>
        <DialogContent className="max-w-3xl">
          {activeProject ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl text-white">
                  {activeProject.title}
                </DialogTitle>
                <DialogDescription className="text-left text-slate-300">
                  {activeProject.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <ListTodo className="h-4 w-4 text-cyan-300" />
                    Checklist
                  </div>
                  <ScrollArea className="h-64 pr-4">
                    <div className="flex flex-col gap-4">
                      {activeProject.tasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-3 text-sm text-slate-300"
                        >
                          <Checkbox
                            checked={task.isCompleted}
                            onCheckedChange={(checked) =>
                              persistTask(task, Boolean(checked))
                            }
                            disabled={
                              isTransitionPending &&
                              stateMeta.type === "task" &&
                              stateMeta.taskId === task.id
                            }
                          />
                          <span>{task.description}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </section>

                <section className="rounded-3xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <NotebookPen className="h-4 w-4 text-purple-300" />
                    Final C++ artefact
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="project-code" className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Paste or upload
                    </Label>
                    <Textarea
                      id="project-code"
                      className="min-h-[240px] font-mono text-sm"
                      placeholder="// Drop the final C++ translation unit for this project."
                      value={codeDraft}
                      onChange={(event) => setCodeDraft(event.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        className="flex-1 gap-2"
                        onClick={persistCode}
                        disabled={isTransitionPending && stateMeta.type === "code"}
                      >
                        {isTransitionPending && stateMeta.type === "code"
                          ? "Archiving..."
                          : "Save artefact"}
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setCodeDraft(activeProject.finalCode ?? "")}
                      >
                        Revert
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

