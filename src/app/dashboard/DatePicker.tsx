"use client";

import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ date }: { date: Date }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    const params = new URLSearchParams();
    params.set("date", format(d, "yyyy-MM-dd"));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 gap-2 text-sm font-medium border-border shadow-sm"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {format(date, "do MMM yyyy")}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-1 rotate-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
