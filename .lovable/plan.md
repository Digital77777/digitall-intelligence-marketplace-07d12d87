

# Programs Feature Enhancement Plan

## Overview
This plan implements three key changes to the Loyalty & Growth Programs feature:
1. **Coming Soon page** for Learning Rewards (4 buttons) and Creator Rewards (2 buttons)
2. **Production-ready detailed pages** for all 4 Community Rewards programs

---

## Part 1: Coming Soon Page

### New Component: `src/pages/programs/ComingSoonPage.tsx`
A beautiful, engaging "Coming Soon" page with:
- Animated gradient background with subtle patterns
- Program-specific title and description passed via URL params
- "Notify Me" email capture form (optional)
- Countdown-style progress indicator
- Back button to return to the programs page
- Responsive design for mobile and desktop

**Visual Elements:**
- Lucide `Rocket` or `Sparkles` icon animation
- Primary gradient text for headings
- Soft card with glassmorphism effect
- Social sharing buttons for excitement building

### Route Addition
Add route `/programs/coming-soon` to `App.tsx`

### Button Updates in `LoyaltyProgramsSection.tsx`
Update 6 buttons (4 Learning + 2 Creator) to navigate to:
```
/programs/coming-soon?program={programSlug}&category={learning|creator}
```

---

## Part 2: Community Rewards - Production Ready Pages

### Program 1: Referral Rewards (`/programs/referral-rewards`)
**Full-featured referral system page with:**
- Hero section with referral stats (total referrals, completed, points earned)
- Share referral link component (existing: `ShareReferralLink`)
- Invite by email form (existing: `InviteByEmail`)
- Referrals list showing status (existing: `ReferralsList`)
- Progress tracker toward milestones (existing: `ReferralProgress`)
- Leaderboard section showing top referrers
- Rewards breakdown card (what users earn per referral)

### Program 2: Community Hero Program (`/programs/community-hero`)
**Recognition system for helpful community members:**
- Hero section explaining the program
- User's Hero Score dashboard with breakdown:
  - Questions answered
  - Helpful replies given
  - Topics started
  - Insights shared
- Leaderboard of top community heroes (weekly/monthly)
- Reward tiers section (Bronze Helper -> Silver Guide -> Gold Mentor -> Diamond Hero)
- Recent activity feed showing user's contributions
- Claim rewards button for eligible users

### Program 3: DIM Quest Missions (`/programs/quests`)
**Gamified task completion system:**
- Active quests grid with progress indicators
- Quest categories: Onboarding, Learning, Community, Creator
- Sample quests:
  - "Complete your profile" (onboarding)
  - "Finish 3 lessons" (learning)
  - "Invite 3 friends" (community)
  - "Upload first project" (creator)
- Completed quests section with badges earned
- Rewards showcase (what completing quests unlocks)
- Daily/Weekly mission rotation indicator

### Program 4: Ambassador Loyalty Program (`/programs/ambassador`)
**Elite program for consistent performers:**
- Program overview with requirements
- Application form for new applicants
- Ambassador dashboard for approved members:
  - Monthly performance metrics
  - Earnings and bonuses
  - Special perks unlocked
- Ambassador tiers (Bronze -> Silver -> Gold -> Platinum Ambassador)
- Ambassador spotlight section (featured ambassadors)
- Exclusive opportunities section

---

## File Structure

```
src/
├── pages/
│   └── programs/
│       ├── ComingSoonPage.tsx        (NEW)
│       ├── ReferralRewardsPage.tsx   (NEW)
│       ├── CommunityHeroPage.tsx     (NEW)
│       ├── QuestsPage.tsx            (NEW)
│       └── AmbassadorPage.tsx        (NEW)
├── components/
│   └── programs/
│       ├── ProgramHero.tsx           (NEW - shared hero component)
│       ├── RewardTierCard.tsx        (NEW - tier display)
│       ├── QuestCard.tsx             (NEW - quest item)
│       ├── LeaderboardCard.tsx       (NEW - user ranking)
│       ├── ActivityFeed.tsx          (NEW - recent actions)
│       └── StatsCard.tsx             (NEW - metrics display)
├── hooks/
│   └── useCommunityPrograms.tsx      (NEW - data fetching)
```

---

## Database Schema (New Tables)

### `community_hero_scores`
Tracks user contributions for Community Hero Program:
- `id`, `user_id`, `questions_answered`, `helpful_replies`, `topics_created`, `insights_shared`, `total_score`, `current_tier`, `created_at`, `updated_at`

### `quests`
Stores available quests:
- `id`, `title`, `description`, `category`, `points_reward`, `icon`, `requirements`, `is_active`, `created_at`

### `user_quest_progress`
Tracks user progress on quests:
- `id`, `user_id`, `quest_id`, `status` (not_started, in_progress, completed), `completed_at`, `created_at`

### `ambassador_applications`
Stores ambassador program applications:
- `id`, `user_id`, `status` (pending, approved, rejected), `application_text`, `social_links`, `reviewed_by`, `reviewed_at`, `created_at`

### `ambassador_stats`
Tracks ambassador performance:
- `id`, `user_id`, `month`, `referrals_count`, `content_created`, `events_hosted`, `total_earnings`, `tier`, `created_at`

---

## Route Updates in App.tsx

```typescript
// Programs (NEW)
{ path: "/programs/coming-soon", component: ComingSoonPage, protected: true },
{ path: "/programs/referral-rewards", component: ReferralRewardsPage, protected: true },
{ path: "/programs/community-hero", component: CommunityHeroPage, protected: true },
{ path: "/programs/quests", component: QuestsPage, protected: true },
{ path: "/programs/ambassador", component: AmbassadorPage, protected: true },
```

---

## Button Navigation Updates

### Learning Rewards Tab (4 buttons -> Coming Soon)
| Program | Current Navigation | New Navigation |
|---------|-------------------|----------------|
| Learn to Earn Points | `/learning-paths` | `/programs/coming-soon?program=learn-to-earn` |
| Skill Level Tiers | `/dashboard` | `/programs/coming-soon?program=skill-tiers` |
| Project Completion Streaks | `/dashboard` | `/programs/coming-soon?program=streaks` |
| Certification Bonuses | `/career-certification` | `/programs/coming-soon?program=certification-bonuses` |

### Creator Rewards Tab (2 buttons -> Coming Soon)
| Program | Current Navigation | New Navigation |
|---------|-------------------|----------------|
| Creator Rewards | `/marketplace/create-listing` | `/programs/coming-soon?program=creator-rewards` |
| Marketplace Loyalty Boost | `/marketplace` | `/programs/coming-soon?program=marketplace-boost` |

### Community Rewards Tab (4 buttons -> Production Pages)
| Program | Current Navigation | New Navigation |
|---------|-------------------|----------------|
| Referral Rewards | `/referral` | `/programs/referral-rewards` |
| Community Hero Program | `/community` | `/programs/community-hero` |
| DIM Quest Missions | `/dashboard` | `/programs/quests` |
| Ambassador Loyalty Program | `/community` | `/programs/ambassador` |

---

## Technical Implementation Details

### Coming Soon Page Features
- URL query params for program context
- Subtle CSS animations (pulse, fade)
- Email subscription form (stores to existing `newsletter_subscriptions` or new table)
- Mobile-responsive layout
- SEO-friendly meta tags

### Community Programs Pages
- Use existing hooks where applicable (`useReferrals`, `useCommunity`)
- New hook `useCommunityPrograms` for program-specific data
- Skeleton loading states for all data-fetching sections
- Toast notifications for user actions
- Progress bars for milestone tracking
- Responsive grid layouts

### Shared Components
- `ProgramHero`: Reusable header with icon, title, description, gradient
- `RewardTierCard`: Display tier info with progress to next tier
- `QuestCard`: Quest display with progress indicator
- `LeaderboardCard`: User ranking display with avatar
- `StatsCard`: Metric display with icon and trend

---

## UI/UX Considerations
- Consistent styling with existing loyalty cards
- Primary gradient theme across all program pages
- Clear CTAs and progress indicators
- Celebratory animations on achievements
- Accessible color contrasts and keyboard navigation
- Mobile-first responsive design

