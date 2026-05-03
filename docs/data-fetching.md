# Data Fetching

## Rule: Server Components Only

**ALL data fetching in this app MUST be done exclusively via Server Components.**

Do NOT fetch data in:
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- `useEffect` hooks
- Any other mechanism

If you need data in a client component, fetch it in a parent Server Component and pass it down as props.

## Rule: Drizzle ORM via `/data` Helper Functions

**ALL database queries MUST go through helper functions located in the `/data` directory.**

- Helper functions use Drizzle ORM exclusively — no raw SQL, no `db.execute()` with raw strings
- One file per domain area (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Server Components import and call these helpers directly — no intermediary API layer

```ts
// CORRECT — Server Component calling a /data helper
import { getWorkoutsForUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const workouts = await getWorkoutsForUser(userId);
  return <WorkoutList workouts={workouts} />;
}
```

```ts
// WRONG — never do this
const res = await fetch("/api/workouts"); // route handler
```

```ts
// WRONG — never do this
useEffect(() => { fetch("/api/workouts") }, []); // client component fetch
```

## Rule: Users Can Only Access Their Own Data

**This is a hard security requirement — every query MUST be scoped to the authenticated user.**

Every helper function in `/data` that returns user-owned records MUST:

1. Accept the authenticated `userId` as an explicit parameter
2. Filter all queries by that `userId` using a Drizzle `.where()` clause
3. Never accept a `userId` from untrusted input (e.g., URL params, request body) without verifying it matches the session user

```ts
// CORRECT — always filter by the authenticated user's ID
export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

```ts
// WRONG — no user scoping, any user's data could be returned
export async function getWorkouts() {
  return db.select().from(workouts); // never do this
}
```

The `userId` passed to `/data` helpers must always come from the server-side session (e.g., `auth()` from your auth library), never from the URL or client-supplied input.

## Summary

| Requirement | Rule |
|---|---|
| Where to fetch data | Server Components only |
| How to query the database | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| Route handlers for data | Never |
| Client-side fetching | Never |
| User data isolation | Every query scoped to authenticated `userId` |
