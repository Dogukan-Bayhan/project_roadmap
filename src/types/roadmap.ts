export type RoadmapNodeDTO = {
  id: number;
  title: string;
  category: string;
  parentId: number | null;
  status: "PENDING" | "IN_PROGRESS" | "MASTERED" | string;
  userCode: string | null;
  longDescription: string;
  implementationSteps: string[];
  learningOutcomes: string;
};

