
# Marketplace Products & Enhanced Detail Page

## Overview
Populate the marketplace with ~40 real AI tool/product listings from the screenshots, and enhance the product detail page with a premium demo video section, feature highlights, and improved UX.

## Part 1: Seed Marketplace with AI Products

Create a new data file `src/data/marketplaceProducts.ts` containing ~40 AI tools extracted from the screenshots. Each product will include:
- Title, description, category, tags, pricing info
- External creation links (to the actual product websites)
- Curated from the screenshots: Unbounce, AdCreative.ai, ClickUp, Murf AI, Gamma, Castmagic, Looka, SaneBox, Brand24, GetResponse, Motion, MeetGeek, Lindy, Reclaim.ai, Seamless.AI, SleekFlow, Lusha, Browse AI, Tidio, Flowith, MindStudio, Emergent, soona, KrispCall, ElevenLabs, Turbotic, Tiki, Adwisely, Synthflow AI, Recomaze AI, Pinecone, Databox, Vista Social, Prezi, Pilim, and more

Create an edge function or use a seeding approach via a utility page/script that inserts these products into the `marketplace_listings` table. Since we need a valid `user_id`, we will use a dedicated "DIM Marketplace" system account (the existing DIM Community account `98e28367-b03f-4af1-a8d7-e2fcf1ec73b6`).

**Approach**: Create a one-time seeding script as a temporary admin action that inserts products via Supabase client, triggered from a data file. The products will be inserted directly using SQL INSERT statements.

## Part 2: Enhanced Product Detail Page

Upgrade `src/pages/ListingDetailPage.tsx` with:

### 2a. Demo Video Section
- Add a new `DemoVideoSection` component that embeds YouTube demo/overview videos for products
- Support for multiple demo videos with tabbed or carousel navigation
- Auto-detect YouTube URLs and render embedded players
- Fallback to a "Request Demo" CTA if no demo video exists

### 2b. Feature Highlights Section  
- Add a `FeatureHighlights` component showing key product features in a visually appealing grid
- Icon-based feature cards with descriptions
- Parse features from the product description or tags

### 2c. Affiliate/Commission Info Banner
- Show earning potential (commission rates) as a highlighted banner
- "Apply to Program" or "Get Started" CTA buttons

### 2d. Enhanced Detail Page Layout
- Add breadcrumb navigation
- Improve the description section with expandable "Read More"
- Add a "Why Choose This Product" section
- Social proof section with usage stats
- Enhanced mobile sticky bar with product name

## Part 3: Product Data Structure

Each product in the seed data will follow this structure:
```typescript
{
  title: "ElevenLabs",
  description: "ElevenLabs' AI Audio makes content accessible in any language...",
  listing_type: "product",
  category_id: "44181a81-cd7f-4bbb-9cdc-190123ee41d6", // AI Tools
  price: 0, // or actual price
  currency: "USD",
  tags: ["AI Audio", "Text-to-Speech", "Voice AI"],
  creation_link: "https://elevenlabs.io",
  is_featured: true/false,
  status: "active",
  // Demo video URLs stored in videos array
  videos: ["https://www.youtube.com/watch?v=..."]
}
```

## Technical Details

### Files to Create:
1. **`src/data/marketplaceProducts.ts`** - Product seed data (~40 AI tools)
2. **`src/components/marketplace/listing/DemoVideoSection.tsx`** - YouTube demo video player component
3. **`src/components/marketplace/listing/FeatureHighlights.tsx`** - Feature grid component
4. **`src/components/marketplace/listing/CommissionBanner.tsx`** - Earning/affiliate info banner

### Files to Modify:
1. **`src/pages/ListingDetailPage.tsx`** - Integrate new sections (demo video, features, commission info)
2. **`src/components/marketplace/listing/index.ts`** - Export new components
3. **`src/components/marketplace/listing/PremiumMediaGallery.tsx`** - Add YouTube embed support for demo videos

### Database Operations:
- INSERT ~40 products into `marketplace_listings` using the DIM Community user ID
- Assign appropriate categories (AI Tools, Digital Products, etc.)
- Mark select products as `is_featured = true` for hero carousel

### YouTube Demo Video Handling:
- Extract video ID from YouTube URLs
- Render using iframe embed with privacy-enhanced mode
- Responsive aspect ratio container
- Lazy loading for performance

### Categories Distribution:
- **AI Tools** (`44181a81-...`): ~25 products (Unbounce, ClickUp, Murf AI, etc.)
- **Digital Products** (`996a0b4d-...`): ~8 products (templates, courses)
- **Freelance Services** (`d537cad3-...`): ~4 products
- **AI Development** (`d7a33383-...`): ~3 products

### Mobile Optimization:
- Demo videos auto-resize on mobile
- Feature cards stack vertically
- Commission banner is compact on small screens
- All new sections respect existing responsive patterns
