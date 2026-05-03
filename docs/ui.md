# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do not create custom UI components. If a UI element is needed, find the appropriate shadcn/ui component.
- Install new shadcn/ui components via `npx shadcn@latest add <component>`.
- Components are located in `src/components/ui/`.

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/).

**Required format: `1st Sep 2025`** — ordinal day, abbreviated month, 4-digit year.

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```

Use this format consistently across all pages, tables, labels, and any other UI that displays a date.
