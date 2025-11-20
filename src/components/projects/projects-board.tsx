"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectDTO } from "@/types/projects";

type ProjectsBoardProps = {
  projects: ProjectDTO[];
};

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project, index) => {
        const completedTasks = project.tasks.filter((task) => task.isCompleted).length;
        return (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <Link
              href={`/projects/${project.id}`}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Card className="h-full border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 transition group-hover:border-cyan-400/60 group-hover:shadow-[0_25px_80px_rgba(34,211,238,0.25)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-2xl text-white">
                    {project.title}
                    <Badge variant="default">
                      {completedTasks}/{project.tasks.length} Done
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
                        {completedTasks} of {project.tasks.length} milestones verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-cyan-200">
                    <span>Open build console</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
