import { db } from "@/db";
import { workouts, workout_exercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, startedAt: Date) {
  const result = await db
    .insert(workouts)
    .values({ user_id: userId, name, started_at: startedAt })
    .returning({ id: workouts.id });
  return result[0];
}

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutStartedAt: workouts.started_at,
      workoutExerciseId: workout_exercises.id,
      exerciseOrder: workout_exercises.order,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.set_number,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workout_exercises, eq(workout_exercises.workout_id, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workout_exercises.exercise_id))
    .leftJoin(sets, eq(sets.workout_exercise_id, workout_exercises.id))
    .where(
      and(
        eq(workouts.user_id, userId),
        gte(workouts.started_at, start),
        lt(workouts.started_at, end)
      )
    );

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      startedAt: Date | null;
      exercises: Map<number, { id: number; name: string; order: number; sets: { setNumber: number; reps: number | null; weight: string | null }[] }>;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName ?? null,
        startedAt: row.workoutStartedAt ?? null,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId !== null && row.exerciseName !== null) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          order: row.exerciseOrder ?? 0,
          sets: [],
        });
      }
      if (row.setId !== null) {
        workout.exercises.get(row.workoutExerciseId)!.sets.push({
          setNumber: row.setNumber ?? 0,
          reps: row.reps,
          weight: row.weight,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()).sort((a, b) => a.order - b.order),
  }));
}
