export type ProjectTaskDTO = {
  id: number;
  description: string;
  isCompleted: boolean;
  projectId: number;
};

export type ProjectDTO = {
  id: number;
  title: string;
  description: string;
  finalCode: string | null;
  tasks: ProjectTaskDTO[];
};

