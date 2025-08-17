import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getConfig, setConfig } from "../../lib/config";

const ConfigSchema = z.object({
  slotDurationMinutes: z.number().min(5).optional(),
  maxSlotsPerAppointment: z.number().min(1).max(5).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workingDays: z.array(z.number().int().min(1).max(7)).optional(),
  daysOff: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  breaks: z.array(z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })).optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const cfg = await getConfig();
    return res.status(200).json(cfg);
  }
  if (req.method === "PUT") {
    try {
      const parsed = ConfigSchema.parse(req.body);
      const merged = await setConfig(parsed);
      return res.status(200).json(merged);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
