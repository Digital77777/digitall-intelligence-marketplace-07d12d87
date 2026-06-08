# Suggested Codebase Improvements

Based on a comprehensive review of the repository, the following improvements are recommended to enhance security, scalability, performance, and maintainability.

## 1. Security: Environment Variable Management
**Current Issue**: Supabase credentials (URL and Anon Key) are hardcoded in `src/integrations/supabase/client.ts`. This poses a severe security risk if the repository is public and is against best practices.
**Recommendation**:
- Remove hardcoded strings.
- Use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Ensure these are added to the `.env` file (locally) and CI/CD secrets (production).

## 2. Architecture: Replace State with React Query
**Current Issue**: Custom hooks like `useSubscription.tsx` use `useState` and `useEffect` for data fetching. This lacks caching, automatic refetching on window focus, and background updates.
**Recommendation**:
- Refactor data-fetching logic to use TanStack Query (`useQuery`, `useMutation`).
- This will simplify state management, reduce boilerplate, and improve UX with better loading/caching states.

## 3. AI Service: Real API Integration
**Current Issue**: `src/lib/aiCodeService.ts` currently uses mock responses for AI features.
**Recommendation**:
- Implement actual calls to the Hugging Face Inference API using the provided API key.
- Add error handling for rate limits (common in free-tier Hugging Face).
- Implement a fallback mechanism or loading skeletons for better UX during slow inference.

## 4. Testing: Enhance Infrastructure and Coverage
**Current Issue**: The current test suite fails because `test-utils.tsx` is missing the `TierProvider`, and there are several outdated expectations.
**Recommendation**:
- Update `AllTheProviders` in `src/test/test-utils.tsx` to include `TierProvider` and `AuthProvider`.
- Modernize `Footer.test.tsx` and `Button.test.tsx` to match the current UI implementation.
- Increase coverage for core business logic, especially in `useSubscription` and `aiCodeService`.

## 5. UI/UX: Performance Optimizations
**Current Issue**: Some heavy pages are lazy-loaded, but there are no visible skeletons, leading to a jarring "blank screen" during load.
**Recommendation**:
- Implement robust skeleton screens for all major feature modules (Marketplace, AI Tools).
- Optimize image assets further by ensuring all static images are in WebP format and properly sized.

## 6. Code Quality: Strict Typing
**Current Issue**: Several places use `any` or have missing type definitions for API responses.
**Recommendation**:
- Leverage the generated `Database` types from Supabase more strictly.
- Define explicit interfaces for all AI service payloads.
