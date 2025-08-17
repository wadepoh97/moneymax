import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "id is required" });

  if (req.method === "DELETE") {
    try {
      const deleted = await prisma.appointment.delete({ where: { id } });
      return res.status(200).json(deleted);
    } catch {
      return res.status(404).json({ error: "Appointment not found" });
    }
  }

  if (req.method === "GET") {
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    return res.status(200).json(appt);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
