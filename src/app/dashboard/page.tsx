import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Dumbbell } from "lucide-react";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { DatePicker } from "./DatePicker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { date: dateParam } = await searchParams;
  const date = dateParam ? parseISO(dateParam) : new Date();

  const workoutExercises = await getWorkoutsForUserOnDate(userId, date);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Lifting Diary
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Workout Log</h1>
        </div>

        <div className="flex items-center gap-3">
          <DatePicker date={date} />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {format(date, "do MMM yyyy")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {workoutExercises.length} exercise{workoutExercises.length !== 1 ? "s" : ""}
            </span>
          </div>

          {workoutExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed text-center">
              <div className="rounded-full bg-muted p-3">
                <Dumbbell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No workouts logged for this date.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-xl border overflow-hidden shadow-sm">
              {workoutExercises.map((exercise) => {
                const setCount = exercise.sets.length;
                const maxWeight = exercise.sets.reduce(
                  (max, s) => (s.weight ? Math.max(max, parseFloat(s.weight)) : max),
                  0
                );
                return (
                  <li
                    key={exercise.id}
                    className="flex items-center gap-4 px-5 py-4 bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Dumbbell className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {setCount} set{setCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {maxWeight > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-base font-semibold">{maxWeight}</span>
                        <span className="text-sm text-muted-foreground ml-0.5">kg</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
