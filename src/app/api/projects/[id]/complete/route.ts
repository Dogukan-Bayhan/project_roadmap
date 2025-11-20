import { NextResponse } from "next/server";

import { logMeaningfulActivity } from "@/lib/activity";
import prisma from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  try {
    const payload = await request.json();
    const projectId = Number(params.id);

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        finalCode: typeof payload.finalCode === "string" ? payload.finalCode : null,
        tasks: {
          updateMany: {
            where: { projectId },
            data: { isCompleted: true },
          },
        },
      },
    });

    await logMeaningfulActivity(`project-complete:${params.id}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to complete project" },
      { status: 500 },
    );
  }
}

