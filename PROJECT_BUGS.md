# Project Bug Audit Report

This report outlines identified logic errors, edge cases, security vulnerabilities, and broken functions within the repository.

---

## 1. Logic Errors
- **Session Isolation in AI Tutor**: The `fetchSessions` function in `useAITutorSessions.tsx` fetches all sessions from the table without filtering by the current `user_id`. This would lead to users seeing each other's conversation history if RLS (Row Level Security) is not perfectly configured in Supabase.
- **Race Conditions in Auth**: In `useAuth.tsx`, both the `onAuthStateChange` listener and `getSession` run on mount. This can lead to double state updates or temporary "flash" of unauthenticated state even for logged-in users.

## 2. Edge Cases
- **AI Chat Message Saving**: In `PersonalAITutorPage.tsx`, if the AI stream fails midway, the partially generated response is not saved to the database. This leads to a mismatch between the UI history and the persisted history.
- **Large Code Complexity cap**: `aiCodeService.ts` caps complexity at 10. For very large enterprise-grade files, this metric becomes useless as it loses granularity.

## 3. Security Vulnerabilities
- **Data Exposure (Low to Medium)**: Relying solely on Supabase RLS without client-side `user_id` filtering (as seen in `useAITutorSessions.tsx`) is risky. Defense-in-depth requires explicit filtering in the query.
- **Insecure HTML Injection**: `src/components/ui/chart.tsx` uses `dangerouslySetInnerHTML`. While currently used for SVG styling, it could be an injection vector if dynamic labels are not sanitized.

## 4. Broken Functions / Technical Debt
- **Footer Stub**: The `Footer.tsx` component was initially an empty stub which caused several navigation-related tests to fail because they expected copyright and link information. (Fixed in previous iteration).
- **Missing Peer Dependencies**: The absence of `@testing-library/dom` was a blocker for the entire test suite. (Fixed in previous iteration).
- **Environment Validation**: The app would crash with cryptic errors if `VITE_SUPABASE_URL` was missing. (Fixed in previous iteration with `validateEnv.ts`).

---

## Most Critical Issues Selected for Immediate Fix
1. **User Data Isolation**: Explicitly adding `.eq('user_id', userId)` to the `fetchSessions` call to ensure users only ever see their own AI conversations.
2. **AI Stream Resilience**: Improving the error handling in `PersonalAITutorPage.tsx` to handle interrupted streams more gracefully.
