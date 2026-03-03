

## Fix Voice-Driven Product Finder

### Problems Identified

1. **Race condition in `onend` handler** (`useVoiceSearch.tsx`): The `recognition.onend` callback uses nested `setState` updater functions to read the current transcript value. This is fragile -- when `onresult` sets the final transcript and `onend` fires immediately after, React may not have committed the state update yet, causing the transcript to appear empty and triggering a false "No speech detected" error.

2. **Double state updates on `no-speech` error**: When a `no-speech` error occurs, `onerror` fires (setting state to `error`), then `onend` also fires and tries to process again, causing conflicting state updates.

3. **Missing CORS headers on edge function** (`voice-search/index.ts`): The current CORS headers only allow `authorization, x-client-info, apikey, content-type`, but the Supabase JS client sends additional headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, etc.) that will cause preflight failures in some browsers.

4. **Auto-start `useEffect` missing dependencies** (`VoiceSearchModal.tsx`): The effect that auto-starts listening on modal open doesn't include `startListening` in its dependency array, risking stale closure references.

---

### Plan

#### 1. Rewrite `useVoiceSearch.tsx` -- fix race condition and error handling

- Use `useRef` to track the final and interim transcripts alongside state, so `onend` can read the latest values synchronously without relying on React state batching.
- Add a `hasErrorRef` flag so that `onend` skips processing when `onerror` already handled the failure.
- Store transcript in a ref that `onresult` updates, and read from that ref in `onend`.

Key changes:
- Add `transcriptRef` and `interimRef` refs updated in `onresult`
- Add `hasErrorRef` set to `true` in `onerror`, checked in `onend`
- Simplify `onend` to read from refs directly instead of nested setState callbacks

#### 2. Update edge function CORS headers (`voice-search/index.ts`)

Update the `corsHeaders` to include the full set of Supabase client headers:

```text
authorization, x-client-info, apikey, content-type,
x-supabase-client-platform, x-supabase-client-platform-version,
x-supabase-client-runtime, x-supabase-client-runtime-version
```

#### 3. Fix auto-start effect in `VoiceSearchModal.tsx`

Add `startListening` and `isSupported` to the dependency array, and add `state` guard to prevent re-triggering.

---

### Technical Details

**File: `src/hooks/useVoiceSearch.tsx`**
- Add refs: `transcriptRef`, `interimTranscriptRef`, `hasErrorRef`
- In `onresult`: update both state and refs
- In `onerror`: set `hasErrorRef.current = true` before setting error state
- In `onend`: check `hasErrorRef`, then read from `transcriptRef.current` and `interimTranscriptRef.current` directly -- no nested setState
- In `startListening`: reset `hasErrorRef.current = false`

**File: `supabase/functions/voice-search/index.ts`**
- Expand `Access-Control-Allow-Headers` to include all Supabase client headers

**File: `src/components/marketplace/voice/VoiceSearchModal.tsx`**
- Fix the auto-start `useEffect` dependency array

