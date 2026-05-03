import { integer, numeric, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const exercises = pgTable("exercises", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workout_exercises: many(workout_exercises),
}));

export const workouts = pgTable("workouts", {
  id: serial().primaryKey(),
  user_id: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  started_at: timestamp(),
  completed_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
});

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workout_exercises: many(workout_exercises),
}));

export const workout_exercises = pgTable("workout_exercises", {
  id: serial().primaryKey(),
  workout_id: integer().notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exercise_id: integer().notNull().references(() => exercises.id),
  order: integer().notNull(),
  created_at: timestamp().defaultNow().notNull(),
});

export const workoutExercisesRelations = relations(workout_exercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workout_exercises.workout_id],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workout_exercises.exercise_id],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const sets = pgTable("sets", {
  id: serial().primaryKey(),
  workout_exercise_id: integer().notNull().references(() => workout_exercises.id, { onDelete: "cascade" }),
  set_number: integer().notNull(),
  reps: integer(),
  weight: numeric({ precision: 6, scale: 2 }),
  created_at: timestamp().defaultNow().notNull(),
});

export const setsRelations = relations(sets, ({ one }) => ({
  workout_exercise: one(workout_exercises, {
    fields: [sets.workout_exercise_id],
    references: [workout_exercises.id],
  }),
}));
