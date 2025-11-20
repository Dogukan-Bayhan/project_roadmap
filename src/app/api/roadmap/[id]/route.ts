import { NextResponse } from "next/server";

import { logSubmissionActivity } from "@/lib/activity";
import prisma from "@/lib/prisma";

const ALLOWED_STATUSES = ["PENDING", "IN_PROGRESS", "MASTERED"] as const;

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: Params) {
  try {
    const payload = await request.json();
    const status = typeof payload.status === "string" ? payload.status : "PENDING";
    const normalizedStatus = ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])
      ? status
      : "PENDING";

    const userCode =
      typeof payload.userCode === "string" ? payload.userCode : "";

    const updated = await prisma.roadmapNode.update({
      where: { id: Number(params.id) },
      data: {
        status: normalizedStatus,
        userCode,
      },
    });

    await logSubmissionActivity(`roadmap:${params.id}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update roadmap node" },
      { status: 500 },
    );
  }
}

