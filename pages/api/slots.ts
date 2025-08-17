import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { getConfig } from "../../lib/config";
import { generateTimes, addMinutes, isWithinRange, weekdayNumber } from "../../lib/time";

interface Appointment {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      slotsTaken?: number;
      createdAt?: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  
  const date = (req.query.date as string) || "";
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "date (YYYY-MM-DD) is required" });

  const cfg = await getConfig();

  // Check working day & days off
  const dow = weekdayNumber(date);
  if (!cfg.workingDays.includes(dow) || cfg.daysOff.includes(date)) {
    return res.status(200).json([]);
  }

  // Get existing appointments for the day
  const appts = await prisma.appointment.findMany({ where: { date } });

  const slots = [];
  for (const t of generateTimes(cfg.openTime, cfg.closeTime, cfg.slotDurationMinutes)) {
    // Exclude breaks
    const inBreak = cfg.breaks.some(b => isWithinRange(t, b.start, b.end));
    if (inBreak) continue;

    const tEnd = addMinutes(t, cfg.slotDurationMinutes);

    const overlapped = appts.some((a: Appointment) => {
      return !(a.endTime <= t || a.startTime >= tEnd);
    });

    slots.push({
      date,
      time: t,
      available_slots: overlapped ? 0 : 1
    });
  }

  return res.status(200).json(slots);
}
