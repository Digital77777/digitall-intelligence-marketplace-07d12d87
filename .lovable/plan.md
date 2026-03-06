

## Plan: Redesign Voice-Driven Product Finder Flow

The current implementation uses a bottom-sheet modal for processing/results, which feels cramped. The user wants:

1. **Blue fullscreen page** stays visible while AI is listening (already works).
2. **A dedicated full-page results view** showing AI-matched products ranked best-first.
3. **Clicking a product navigates to** `/marketplace/listing/:id`.

### Current State

- `FullscreenListeningView` (blue page) is already shown during `idle`/`listening` states -- this works.
- `ProcessingView` and `ResultsView` are rendered inside a small bottom-sheet modal -- this is what needs to change.
- `RecommendationCard` already navigates to listing detail on click.

### Changes

**File: `src/components/marketplace/voice/VoiceSearchModal.tsx`**

Replace the bottom-sheet layout (lines 90-148) with fullscreen views for both `processing` and `results` states:

1. **Processing state**: Show a fullscreen view (same blue gradient background) with the animated processing steps, keeping the user immersed in the experience rather than switching to a modal.

2. **Results state**: Show a fullscreen white/background page with:
   - Header bar with "AI Product Finder" title, result count, and close button
   - The search query displayed as a subtitle
   - "AI ranked" badge
   - Full-height scrollable list of `RecommendationCard` items, sorted by `match_score` descending (already sorted by the edge function)
   - Each card shows rank badge, product image/initial, name, score %, explanation, and arrow
   - Clicking any card calls `navigate(/marketplace/listing/${id})` and closes the modal
   - Bottom area: "Search again" button + text input for refinement

3. **Error state**: Also show fullscreen instead of bottom-sheet for consistency.

4. Remove the bottom-sheet wrapper entirely -- all states use fullscreen layouts.

### Technical Details

- Remove the `showFullscreen` conditional that only covers `idle`/`listening`. Instead, render all states as fullscreen.
- The `ProcessingView` will get a blue gradient background matching the listening view, with a centered spinner/steps animation.
- The `ResultsView` will become a full-page layout with a proper scrollable list, larger cards, and clearer visual hierarchy.
- The `RecommendationCard` component will be slightly enlarged for the full-page context.
- No changes to `useVoiceSearch.tsx` or the edge function -- only the modal component changes.

