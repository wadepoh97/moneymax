# MoneyMax Appointments API (Next.js + Prisma)

Simple appointment scheduling API with configurable slots, hours, days, breaks, and days off.

## Quick Start
```bash
npm install
cp .env.example .env
# set DATABASE_URL in .env (SQLite or Postgres)
# e.g. SQLite: DATABASE_URL="file:./dev.db"
# e.g. Postgres: DATABASE_URL="postgresql://user:pass@localhost:5432/db"

npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Endpoints
- GET `/api/slots?date=YYYY-MM-DD`
- POST `/api/appointments` body: `{ "date":"YYYY-MM-DD", "time":"HH:mm", "slots":1..5 }`
- GET `/api/appointments`
- DELETE `/api/appointments/:id`
- GET `/api/config`
- PUT `/api/config`

## Notes
- Time format: "HH:mm", Dates: "YYYY-MM-DD".
- Defaults: Mon–Fri, 09:00–18:00, 30-minute slots, max 5 slots per appointment.
- Prevents double bookings; breaks and days off excluded from slots.

## Docs (MkDocs)
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r .\docs\requirements.txt
mkdocs serve
```
Open http://127.0.0.1:8000. Read the Docs uses `.readthedocs.yaml` at repo root.