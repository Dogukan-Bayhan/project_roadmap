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
  longDescription: string;
  implementationSteps: string[];
  learningOutcomes: string;
  techStack: string[];
  finalCode: string | null;
  tasks: ProjectTaskDTO[];
};

