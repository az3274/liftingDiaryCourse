import { db } from "@/db";
import { workouts, workout_exercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutExerciseId: workout_exercises.id,
      exerciseOrder: workout_exercises.order,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.set_number,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .innerJoin(workout_exercises, eq(workout_exercises.workout_id, workouts.id))
    .innerJoin(exercises, eq(exercises.id, workout_exercises.exercise_id))
    .leftJoin(sets, eq(sets.workout_exercise_id, workout_exercises.id))
    .where(
      and(
        eq(workouts.user_id, userId),
        gte(workouts.started_at, start),
        lt(workouts.started_at, end)
      )
    );

  // Group into workout_exercises with their sets
  const exerciseMap = new Map<
    number,
    { id: number; name: string; order: number; sets: { setNumber: number; reps: number | null; weight: string | null }[] }
  >();

  for (const row of rows) {
    if (!exerciseMap.has(row.workoutExerciseId)) {
      exerciseMap.set(row.workoutExerciseId, {
        id: row.workoutExerciseId,
        name: row.exerciseName,
        order: row.exerciseOrder,
        sets: [],
      });
    }
    if (row.setId !== null) {
      exerciseMap.get(row.workoutExerciseId)!.sets.push({
        setNumber: row.setNumber ?? 0,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return Array.from(exerciseMap.values()).sort((a, b) => a.order - b.order);
}
