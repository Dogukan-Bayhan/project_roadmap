"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ListTodo } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            <Card className="h-full border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40">
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
                <Button variant="glass" className="w-full gap-2" asChild>
                  <Link href={`/projects/${project.id}`}>
                    Open build console <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

