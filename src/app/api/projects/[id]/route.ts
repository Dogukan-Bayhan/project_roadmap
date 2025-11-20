import { NextResponse } from "next/server";

import { logSubmissionActivity } from "@/lib/activity";
import prisma from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const { finalCode } = await request.json();
    const updated = await prisma.project.update({
      where: { id: Number(params.id) },
      data: {
        finalCode: typeof finalCode === "string" ? finalCode : null,
      },
    });

    await logSubmissionActivity(`project:${params.id}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update project" },
      { status: 500 },
    );
  }
}

