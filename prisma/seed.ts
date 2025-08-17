import { prisma } from "../lib/prisma";
import { setConfig } from "../lib/config";

async function main() {
  await setConfig({
    slotDurationMinutes: 30,
    maxSlotsPerAppointment: 5,
    openTime: "09:00",
    closeTime: "18:00",
    workingDays: [1,2,3,4,5],
    daysOff: [],
    breaks: [{ start: "12:30", end: "13:30" }]
  });

  console.log("Seeded config and sample data.");
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
