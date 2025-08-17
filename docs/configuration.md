# Configuration

Runtime configuration is managed via `lib/config.ts`.

## Shape

```ts
type BreakWindow = { start: string; end: string };

type RuntimeConfig = {
  slotDurationMinutes: number;
  maxSlotsPerAppointment: number;
  openTime: string;   // "HH:mm"
  closeTime: string;  // "HH:mm"
  workingDays: number[]; // 1..7 (Mon..Sun)
  daysOff: string[];     // ["YYYY-MM-DD", ...]
  breaks: BreakWindow[]; // [{ start, end }, ...]
};
```

## Reading config

```ts
import { getConfig } from "@/lib/config";

const cfg = await getConfig();
console.log(cfg.openTime, cfg.workingDays);
```

## Updating config

```ts
import { setConfig } from "@/lib/config";

await setConfig({
  slotDurationMinutes: 20,
  workingDays: [1,2,3,4,5],
  daysOff: ["2025-08-31"],
  breaks: [{ start: "12:30", end: "13:30" }],
});
```

## Storage details

- The DB columns (`workingDaysJson`, `daysOffJson`, `breaksJson`) are TEXT.
- Values are serialized with `JSON.stringify` when writing and parsed when reading.