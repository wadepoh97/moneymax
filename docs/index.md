# MoneyMax Appointments API

Welcome. This site documents the Next.js-based appointments API.

## Quick start

- Install deps:
  - Node.js (LTS)
  - Python 3.11+ (for docs)
- Install project packages:
  - `npm install`
- Database:
  - Set `DATABASE_URL` in `.env`
  - `npx prisma migrate dev`
- Run dev:
  - `npm run dev`

## Local docs

- Create a virtual env (optional but recommended)
- Install mkdocs
- Serve docs locally

### Commands (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r .\docs\requirements.txt

# serve locally at http://127.0.0.1:8000
mkdocs serve

# build static site to .\site\
mkdocs build
```

## Project structure

- App/API code: Next.js
- Database: Prisma + your DB
- Docs: MkDocs (hostable on Read the Docs)

## Read the Docs

- Connect your repo on readthedocs.org
- It will use `.readthedocs.yaml` and `mkdocs.yml` automatically