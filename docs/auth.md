# Authentication

## Rule: Clerk is the Only Auth Solution

**ALL authentication in this app MUST use Clerk.** Do not use NextAuth, custom JWT, session cookies, or any other auth library.

- Never implement custom login/signup forms — use Clerk's hosted UI or prebuilt components
- Never store passwords or issue tokens manually
- Never roll your own session logic

## Getting the Current User

### In Server Components

Use `auth()` from `@clerk/nextjs/server` to get the current user's ID. Always `await` it (async API in Next.js 16).

```ts
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // pass userId to /data helpers
}
```

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`.

```ts
"use client";
import { useAuth } from "@clerk/nextjs";

export function ProfileButton() {
  const { userId, isSignedIn } = useAuth();
  // ...
}
```

## Protecting Routes

Use Clerk middleware (configured in `middleware.ts`) to protect routes. Do not manually redirect unauthenticated users inside every page — rely on the middleware matcher.

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## Passing userId to Data Helpers

The `userId` from `auth()` is the single source of truth for scoping database queries. Always pass it explicitly to `/data` helper functions — never derive or trust a user ID from request params or form input.

```ts
// CORRECT
const { userId } = await auth();
const workouts = await getWorkoutsForUser(userId);

// WRONG — never trust user-supplied IDs
const workouts = await getWorkoutsForUser(params.userId);
```

## Clerk Components

Use Clerk's prebuilt UI components for sign-in, sign-up, and user profile flows.

```tsx
import { SignIn, SignUp, UserButton } from "@clerk/nextjs";
```

Do not build custom auth UI from scratch.

## Environment Variables

Clerk requires these environment variables (set in `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Do not expose `CLERK_SECRET_KEY` to the client. Only `NEXT_PUBLIC_` prefixed variables are safe for client-side use.
