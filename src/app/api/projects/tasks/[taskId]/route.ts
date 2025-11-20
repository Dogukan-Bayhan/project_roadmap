import { NextResponse } from "next/server";

import { logSubmissionActivity } from "@/lib/activity";
import prisma from "@/lib/prisma";

type Params = {
  params: {
    taskId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const payload = await request.json();
    const updated = await prisma.projectTask.update({
      where: { id: Number(params.taskId) },
      data: {
        isCompleted: Boolean(payload.isCompleted),
      },
    });

    await logSubmissionActivity(`project-task:${params.taskId}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update project task" },
      { status: 500 },
    );
  }
}

