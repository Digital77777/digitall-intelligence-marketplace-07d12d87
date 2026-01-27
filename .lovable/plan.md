

# Marketplace Browse Page Prerendering Implementation

## Overview

This plan implements prerendering for the `/marketplace/browse` page to improve initial load performance, SEO, and perceived speed. Since this is a client-side React SPA without a Node.js server, we'll use a multi-layered approach combining build-time prerendering, enhanced data prefetching, and optimistic UI patterns.

---

## Current State Analysis

**Architecture:**
- The app is a Vite + React SPA with client-side routing
- `BrowseMarketplacePage` is lazy-loaded via `React.lazy()`
- Data is fetched client-side using `useMarketplace` hook
- Existing prefetch system in `usePrefetch.tsx` handles route and data prefetching
- PWA service worker caches static assets

**Performance Bottleneck:**
- Users see a blank loading state while the page chunk loads
- Data fetching starts only after the component mounts
- No static HTML for search engines or instant first paint

---

## Implementation Strategy

### Phase 1: Build-Time Static HTML Prerendering

Install and configure `vite-plugin-html-prerender` to generate static HTML for the marketplace browse page at build time.

**What it does:**
- Renders the page with a headless browser during build
- Creates a static `marketplace/browse/index.html` with the skeleton UI already rendered
- Search engines and users see content immediately while React hydrates

**Files to modify:**
- `package.json` - Add dependency
- `vite.config.ts` - Configure prerender plugin

### Phase 2: Enhanced Marketplace Data Prefetching

Upgrade the existing prefetch system to aggressively prefetch marketplace browse data earlier and more comprehensively.

**Improvements:**
- Add `/marketplace/browse` to `coreRoutes` for automatic prefetching on app load
- Create dedicated `prefetchMarketplaceBrowseData()` function that fetches all data needed by the browse page
- Prefetch categories, suggested listings, top charts, and category listings in parallel
- Use specific query keys matching what `useMarketplace` uses

**Files to modify:**
- `src/hooks/usePrefetch.tsx` - Enhanced marketplace prefetching

### Phase 3: Eager Loading for Marketplace Browse

Change the marketplace browse page from lazy-loaded to eagerly-loaded for instant navigation.

**What it does:**
- Import `BrowseMarketplacePage` directly instead of using `lazy()`
- The page chunk is included in the main bundle
- Navigation to `/marketplace/browse` is instantaneous

**Trade-off consideration:** Slightly larger initial bundle, but justified because:
- Marketplace is a core user journey
- Memory indicates premium marketplace experience is a priority
- The page components are already optimized

**Files to modify:**
- `src/App.tsx` - Change from lazy to eager import

### Phase 4: Streaming Skeleton with Prerendered Shell

Enhance the skeleton loading states to be rendered inline in the HTML, providing instant visual feedback.

**What it does:**
- Create a static shell component that renders the marketplace layout skeleton
- This skeleton is prerendered into the HTML
- React hydrates and replaces with real data seamlessly

**Files to create:**
- `src/components/marketplace/browse/MarketplaceBrowseShell.tsx` - Static prerenderable shell

**Files to modify:**
- `src/pages/BrowseMarketplacePage.tsx` - Integrate shell for smoother transitions

### Phase 5: SEO and Meta Tag Optimization

Add proper SEO meta tags for the marketplace browse page to improve search engine visibility.

**Files to modify:**
- `src/pages/BrowseMarketplacePage.tsx` - Add `SEOHead` component with marketplace-specific metadata

---

## Technical Details

### Vite Config Changes

```typescript
// vite.config.ts additions
import { htmlPrerender } from 'vite-plugin-html-prerender';
import path from 'path';

// Add to plugins array:
htmlPrerender({
  staticDir: path.join(__dirname, 'dist'),
  routes: ['/marketplace/browse'],
  selector: '#root',
  minify: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
  },
})
```

### Enhanced Prefetch Implementation

```typescript
// New function in usePrefetch.tsx
const prefetchMarketplaceBrowseData = useCallback(() => {
  if (prefetchedData.has('marketplace-browse')) return;
  prefetchedData.add('marketplace-browse');

  // Prefetch categories
  queryClient.prefetchQuery({
    queryKey: ['marketplace-categories'],
    queryFn: async () => { /* fetch categories */ },
    staleTime: 1000 * 60 * 10,
  });

  // Prefetch featured/suggested listings
  queryClient.prefetchQuery({
    queryKey: ['marketplace-suggested'],
    queryFn: async () => { /* fetch suggested */ },
    staleTime: 1000 * 60 * 10,
  });

  // Prefetch top chart listings
  queryClient.prefetchQuery({
    queryKey: ['marketplace-top-charts'],
    queryFn: async () => { /* fetch top charts */ },
    staleTime: 1000 * 60 * 10,
  });

  // Prefetch category listings
  queryClient.prefetchQuery({
    queryKey: ['marketplace-category-listings'],
    queryFn: async () => { /* fetch all category listings */ },
    staleTime: 1000 * 60 * 10,
  });
}, [queryClient]);
```

### Static Shell Component

```typescript
// MarketplaceBrowseShell.tsx
export const MarketplaceBrowseShell = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-6 space-y-8">
      <MarketplaceSkeleton variant="hero" />
      <MarketplaceSkeleton variant="search" />
      <MarketplaceSkeleton variant="tabs" />
      <MarketplaceSkeleton variant="carousel" />
      <MarketplaceSkeleton variant="grid" />
    </div>
  </div>
);
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add `vite-plugin-html-prerender` dependency |
| `vite.config.ts` | Modify | Configure prerender plugin for `/marketplace/browse` |
| `src/App.tsx` | Modify | Change marketplace browse from lazy to eager import |
| `src/hooks/usePrefetch.tsx` | Modify | Add comprehensive marketplace browse data prefetching |
| `src/components/marketplace/browse/MarketplaceBrowseShell.tsx` | Create | Static prerenderable shell component |
| `src/pages/BrowseMarketplacePage.tsx` | Modify | Add SEOHead and integrate shell for smoother UX |

---

## Expected Outcomes

1. **Faster First Paint**: Static HTML shows skeleton immediately instead of blank page
2. **Improved SEO**: Search engines can index marketplace content
3. **Instant Navigation**: Eager loading + prefetched data = zero-wait navigation
4. **Better UX**: Smooth transition from skeleton to content without jarring loading states
5. **PWA Benefits**: Service worker caches prerendered HTML for offline-capable browsing

---

## Considerations

- **Bundle Size**: Eager loading adds ~50-80KB to main bundle (acceptable for core feature)
- **Build Time**: Prerendering adds ~10-15s to build (runs headless browser)
- **Cache Strategy**: Prerendered HTML uses existing NetworkFirst strategy for freshness
- **Dynamic Content**: Real data still fetches client-side; skeleton provides instant feedback

