import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getConfig } from "../../../lib/config";
import { addMinutes } from "../../../lib/time";

const CreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  slots: z.number().int().min(1).max(5).default(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const list = await prisma.appointment.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(list);
  }
  if (req.method === "POST") {
    try {
      const { date, time, slots } = CreateSchema.parse(req.body);
      const cfg = await getConfig();
      if (slots > cfg.maxSlotsPerAppointment) {
        return res.status(400).json({ error: `slots cannot exceed maxSlotsPerAppointment (${cfg.maxSlotsPerAppointment})` });
      }

      // check that requested fits within hours
      const duration = cfg.slotDurationMinutes * slots;
      const endTime = addMinutes(time, duration);

      // generate slots for the day
      const appts = await prisma.appointment.findMany({ where: { date } });
      const overlaps = appts.some(a => !(a.endTime <= time || a.startTime >= endTime));
      if (overlaps) {
        return res.status(409).json({ error: "Requested time overlaps an existing appointment" });
      }
      const inBreak = (await import("../../../lib/config")).getConfig().then(cfg2 =>
        cfg2.breaks.some(b => !(b.end <= time || b.start >= endTime))
      );
      if (await inBreak) {
        return res.status(409).json({ error: "Requested time intersects a break" });
      }
      const created = await prisma.appointment.create({
        data: {
          date,
          startTime: time,
          endTime,
          slotsTaken: slots
        }
      });
      return res.status(201).json(created);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
