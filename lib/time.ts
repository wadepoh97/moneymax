import dayjs from "dayjs";

export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function* generateTimes(startHHMM: string, endHHMM: string, stepMin: number) {
  let t = parseTimeToMinutes(startHHMM);
  const end = parseTimeToMinutes(endHHMM);
  while (t < end) {
    yield minutesToHHMM(t);
    t += stepMin;
  }
}

export function isWithinRange(time: string, start: string, end: string) {
  const t = parseTimeToMinutes(time);
  return t >= parseTimeToMinutes(start) && t < parseTimeToMinutes(end);
}

export function addMinutes(hhmm: string, delta: number) {
  return minutesToHHMM(parseTimeToMinutes(hhmm) + delta);
}

export function weekdayNumber(dateStr: string): number {
  // 1=Mon .. 7=Sun
  const d = dayjs(dateStr);
  const dow = d.day(); // 0..6 (Sun..Sat)
  return dow === 0 ? 7 : dow;
}
