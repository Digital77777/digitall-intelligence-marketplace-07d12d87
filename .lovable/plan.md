

# Reassign Marketplace Listings to @DIM_Earn and Grant Edit Access

## Overview
Transfer ownership of all 39 seeded marketplace products to the @DIM_Earn account (`fce177b9-604d-4e7c-b904-5f18ccf1ec73`) and ensure this account can edit all marketplace listings.

## What Changes

### 1. Database: Update listing ownership (SQL UPDATE)
Run an UPDATE statement to change the `user_id` on all marketplace listings currently owned by `04813cca-d8cf-4a63-b1f5-02b40d99d157` to the @DIM_Earn user ID `fce177b9-604d-4e7c-b904-5f18ccf1ec73`.

```sql
UPDATE marketplace_listings 
SET user_id = 'fce177b9-604d-4e7c-b904-5f18ccf1ec73'
WHERE user_id = '04813cca-d8cf-4a63-b1f5-02b40d99d157';
```

This automatically grants @DIM_Earn edit/delete access to all those listings through the existing RLS policy: **"Users can manage their own listings"** (`auth.uid() = user_id`).

### 2. Update seed data file
Update `src/data/marketplaceProducts.ts` to use the correct @DIM_Earn user ID (`fce177b9-604d-4e7c-b904-5f18ccf1ec73`) so any future re-seeding uses the right account.

## Why This Works
The existing RLS policy on `marketplace_listings` already allows users to manage (SELECT, INSERT, UPDATE, DELETE) their own listings via `auth.uid() = user_id`. By changing ownership to @DIM_Earn, that account automatically gets full edit access to all products. No new policies or roles are needed.

## Files to Modify
- `src/data/marketplaceProducts.ts` -- update the system user ID constant

## Database Operations
- UPDATE all listings from old user to @DIM_Earn (using the data insert tool, not a migration)

