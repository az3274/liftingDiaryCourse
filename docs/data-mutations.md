# Data Mutations

## Rule: Drizzle ORM via `/data` Helper Functions

**ALL database mutations MUST go through helper functions located in the `src/data` directory.**

- Helper functions use Drizzle ORM exclusively — no raw SQL, no `db.execute()` with raw strings
- One file per domain area (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Mutation helpers handle only the db call — no auth, no validation logic inside them

```ts
// CORRECT — src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}

export async function deleteWorkout(id: string, userId: string) {
  return db.delete(workouts).where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
}
```

```ts
// WRONG — never write db calls directly inside a server action or component
await db.insert(workouts).values({ userId, name }); // do this in /data only
```

## Rule: Server Actions in Colocated `actions.ts` Files

**ALL data mutations MUST be triggered via Server Actions defined in colocated `actions.ts` files.**

- Place `actions.ts` next to the page or feature it belongs to (e.g., `app/dashboard/workouts/actions.ts`)
- Every file must begin with `"use server"`
- Do not put Server Actions inside page or component files
- Do not use Route Handlers (`app/api/`) for mutations

```ts
// CORRECT — app/dashboard/workouts/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { createWorkoutSchema } from "./schemas";
import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // 1. authenticate
  // 2. validate
  // 3. call /data helper
}
```

```ts
// WRONG — mutations inside a component file
export default function WorkoutForm() {
  async function handleSubmit() { // never do this
    "use server";
    await db.insert(workouts).values(...);
  }
}
```

## Rule: Typed Parameters — No `FormData`

**ALL Server Action parameters MUST be explicitly typed TypeScript types or interfaces.**

- Never use `FormData` as a parameter type
- Define input types alongside or near the action, or in a shared `types.ts`
- Derive types from Zod schemas using `z.infer<>` to keep types and validation in sync

```ts
// CORRECT — typed input derived from Zod schema
import { z } from "zod";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) { ... }
```

```ts
// WRONG — FormData parameter
export async function createWorkoutAction(formData: FormData) { ... } // never do this
```

## Rule: Validate All Inputs with Zod

**ALL Server Actions MUST validate their arguments with Zod before doing anything else.**

- Define schemas in the same `actions.ts` file or a colocated `schemas.ts`
- Call `schema.parse()` or `schema.safeParse()` at the top of every action, before auth or db calls
- Throw or return an error immediately if validation fails — never proceed with invalid input

```ts
// CORRECT — validate first, then authenticate, then mutate
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await createWorkout(userId, parsed.data.name, parsed.data.date);
}
```

```ts
// WRONG — no validation before mutating
export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { userId } = await auth();
  await createWorkout(userId, input.name, input.date); // never skip validation
}
```

## Summary

| Requirement | Rule |
|---|---|
| Where to write db mutations | `src/data` helpers via Drizzle ORM only |
| Where to define Server Actions | Colocated `actions.ts` files, `"use server"` at top |
| Server Action parameter types | Explicit TypeScript types — never `FormData` |
| Input validation | Zod, always, at the top of every action |
| Raw SQL in mutations | Never |
| Route Handlers for mutations | Never |
| User data isolation | Always scope mutations to authenticated `userId` from `auth()` |
