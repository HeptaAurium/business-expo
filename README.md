# Booth Booking System

Interactive, theatre-style booth booking for the business expo.

## Stack

- Next.js (App Router, TypeScript) — `web/`
- Prisma + PostgreSQL
- Docker + Docker Compose for local dev

## Getting started

```bash
cp web/.env.example web/.env
docker compose up --build
```

App runs at http://localhost:3000. Postgres is exposed on 5432.

Once the booth layout and model are added to `web/prisma/schema.prisma`:

```bash
docker compose exec web npm run db:migrate
```

## Status

Project scaffolding only. Booth data model, floor-map component, and
booking logic land once the venue layout is finalized.
