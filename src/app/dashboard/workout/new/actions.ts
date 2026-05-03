"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error?.issues[0]?.message ?? "Invalid input");
  }

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await createWorkout(userId, parsed.data.name, parsed.data.startedAt);
  const dateParam = parsed.data.startedAt.toISOString().split("T")[0];
  redirect(`/dashboard?date=${dateParam}`);
}
