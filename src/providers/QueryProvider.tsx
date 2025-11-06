"use client"

import { useState, ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 10 minutes  
            gcTime: 10 * 60 * 1000, // "garbage collection time" (was "cacheTime" in v4)
            // Retry failed requests once
            retry: 1,
            // Don't refetch when window regains focus
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools - only shows in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

/**
 * 
STALE TIME - 5 MINS
 Timeline:
🕐 0:00 - You open create-meetup page → Fetches sports from API
🕐 0:30 - You navigate away, come back → Uses cached data (NO API call!)
🕐 2:00 - Navigate away, come back → Still uses cached data (NO API call!)
🕐 6:00 - Navigate away, come back → Data is stale now → Fetches fresh data
Why 5 minutes?
Sports don't change often. If admin adds a new sport, users will see it within 5 minutes max.
Shorter time (30 seconds): More API calls, always fresh data
Longer time (30 minutes): Fewer API calls, might see old data longer
 * 
 * 
 GC TIME - 10 mins 
What is "unused data"?
- Data that NO component is currently using.
Real World Example:
Scenario:
- You're on create-meetup page
- Sports data is being used ✅
- Status: "Active in memory"
- You navigate to profile page
- No component needs sports anymore ❌
Status: "Unused but kept in cache"
React Query: "I'll keep this for 10 more minutes in case you come back"
You come back to create-meetup within 10 minutes
React Query: "Great! I still have it!" (instant load)
You come back after 15 minutes
React Query: "I deleted it to free memory" (must refetch)
Why 10 minutes?
Gives you time to navigate around the app and come back without reloading data.
Think of it like:
Closing a tab but keeping it in "Recently Closed" for 10 minutes
After 10 minutes, it's permanently gone


Retry - When API calls fail
Without retry:
- API call fails (network hiccup) ❌
- User sees error immediately
- User must manually refresh
With retry: 1:
- API call fails (network hiccup) ❌
- React Query: "Let me try one more time..."
- Second attempt succeeds ✅
- User never knew there was a problem!
When does it retry?
- Network timeout
- Server returned 500 error
- Connection interrupted
When does it NOT retry?
- 404 Not Found (makes no sense to retry)
- 401 Unauthorized (retry won't help)
Why retry: 1 (not more)?
-retry: 0 - Never retry (fails fast but annoying)
-retry: 1 - One retry (good balance) ⭐
-retry: 3 - Three retries (might be slow if API is actually down)

 */