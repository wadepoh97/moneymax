import { prisma } from "./prisma";

export type BreakWindow = { start: string; end: string };

export type RuntimeConfig = {
  slotDurationMinutes: number;
  maxSlotsPerAppointment: number;
  openTime: string;
  closeTime: string;
  workingDays: number[]; // 1..7
  daysOff: string[]; // YYYY-MM-DD
  breaks: BreakWindow[];
};

const DEFAULTS: RuntimeConfig = {
  slotDurationMinutes: 30,
  maxSlotsPerAppointment: 5,
  openTime: "09:00",
  closeTime: "18:00",
  workingDays: [1,2,3,4,5],
  daysOff: [],
  breaks: []
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

export async function getConfig(): Promise<RuntimeConfig> {
  const cfg = await prisma.config.findUnique({ where: { id: 1 } });
  if (!cfg) return DEFAULTS;

  return {
    slotDurationMinutes: cfg.slotDurationMinutes,
    maxSlotsPerAppointment: cfg.maxSlotsPerAppointment,
    openTime: cfg.openTime,
    closeTime: cfg.closeTime,
    workingDays: parseJson<number[]>(cfg.workingDaysJson as unknown, DEFAULTS.workingDays),
    daysOff: parseJson<string[]>(cfg.daysOffJson as unknown, DEFAULTS.daysOff),
    breaks: parseJson<BreakWindow[]>(cfg.breaksJson as unknown, DEFAULTS.breaks),
  };
}

export async function setConfig(update: Partial<RuntimeConfig>): Promise<RuntimeConfig> {
  const current = await getConfig();
  const merged: RuntimeConfig = { ...current, ...update };
  if (merged.slotDurationMinutes < 5) throw new Error("slotDurationMinutes must be >= 5");
  if (merged.maxSlotsPerAppointment < 1 || merged.maxSlotsPerAppointment > 5) {
    throw new Error("maxSlotsPerAppointment must be between 1 and 5");
  }

  await prisma.config.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      slotDurationMinutes: merged.slotDurationMinutes,
      maxSlotsPerAppointment: merged.maxSlotsPerAppointment,
      openTime: merged.openTime,
      closeTime: merged.closeTime,
      workingDaysJson: JSON.stringify(merged.workingDays),
      daysOffJson: JSON.stringify(merged.daysOff),
      breaksJson: JSON.stringify(merged.breaks),
    },
    update: {
      slotDurationMinutes: merged.slotDurationMinutes,
      maxSlotsPerAppointment: merged.maxSlotsPerAppointment,
      openTime: merged.openTime,
      closeTime: merged.closeTime,
      workingDaysJson: JSON.stringify(merged.workingDays),
      daysOffJson: JSON.stringify(merged.daysOff),
      breaksJson: JSON.stringify(merged.breaks),
    },
  });
  return merged;
}