import prisma from "@/lib/prisma";

const MS_IN_DAY = 86_400_000;

const ACTIVITY_TYPES = {
  MEANINGFUL: "meaningful",
} as const;

const startOfUTC = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const formatDayKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDayKey = (key: string) => {
  const [year, month, day] = key.split("-").map((value) => Number(value));
  return new Date(Date.UTC(year, month - 1, day));
};

export async function logMeaningfulActivity(metadata?: string) {
  const todayStart = startOfUTC(new Date());
  const existing = await prisma.userActivity.findFirst({
    where: {
      activityDate: { gte: todayStart },
    },
  });

  if (existing) {
    if (metadata && !existing.metadata) {
      await prisma.userActivity.update({
        where: { id: existing.id },
        data: { metadata },
      });
    }
    return;
  }

  await prisma.userActivity.create({
    data: {
      type: ACTIVITY_TYPES.MEANINGFUL,
      activityDate: new Date(),
      metadata,
    },
  });
}

export async function getCurrentStreak() {
  const activities = await prisma.userActivity.findMany({
    select: { activityDate: true },
    orderBy: { activityDate: "desc" },
  });

  const uniqueDayKeys: string[] = [];
  const seen = new Set<string>();

  activities.forEach((activity) => {
    const key = formatDayKey(activity.activityDate);
    if (!seen.has(key)) {
      uniqueDayKeys.push(key);
      seen.add(key);
    }
  });

  let streak = 0;
  let cursor = startOfUTC(new Date());

  for (const key of uniqueDayKeys) {
    const day = parseDayKey(key);
    const diff = Math.floor((cursor.getTime() - day.getTime()) / MS_IN_DAY);

    if (diff === 0) {
      streak += 1;
      cursor = new Date(cursor.getTime() - MS_IN_DAY);
      continue;
    }

    if (diff === 1) {
      // There was a gap before this activity; streak ends here.
      break;
    }

    if (diff > 1) {
      break;
    }
  }

  return streak;
}

export function linesOfCodeFromText(input?: string | null) {
  if (!input) return 0;
  return input.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

