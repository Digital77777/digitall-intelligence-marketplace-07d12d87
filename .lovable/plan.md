## DIM Growth Engine — Phase 1 Plan (Quests, XP, Partner Program, Success Wall)

Scope: Phases 1, 2, 4, 9 from your spec. Levels, Career Score, Champions, Leaderboards, Profiles upgrade, Enterprise come in a second plan once this lands.

### Guiding principles
- Reuse: `mission_progress`, `quests`/`user_quest_progress`, `referrals`, `referral_contests`, `community_hero_scores`, `profiles`.
- Hybrid data: extend in place where cheap (profiles gets `xp_total`, `level_slug`); add new tables only for things that don't exist (xp ledger, partner analytics, success stories).
- Hybrid calc: XP incremented on action via triggers (hot path); Career Score (next phase) will be computed.
- One new top-level route `/growth` hosting hub UI; XP chips and Success Wall slots get embedded into Dashboard, Profile, Community.

---

### Phase 1 — Quests upgrade

Keep the existing `quests` table (already has category/points/icon/difficulty) and `user_quest_progress`. Seed it with the new mission catalog grouped into the 5 categories (Onboarding, Learning, Building, Community, Growth) — ~20 quests total. Examples per category:
- Onboarding: complete_profile, upload_avatar, add_skills, join_community
- Learning: complete_lesson, finish_module, earn_certificate
- Building: upload_project, publish_portfolio, complete_challenge
- Community: post_discussion, answer_question, attend_event
- Growth: invite_friend, share_profile, share_project

Each quest row stores `points_reward` (XP), `badge_slug` (badge progress), `reputation_points`, `career_score_points` (used in next phase). New columns on `quests`: `badge_slug text`, `reputation_points int default 0`, `career_score_points int default 0`, `event_key text` (the canonical action that auto-completes it).

Auto-completion: a single SQL function `award_quest_event(p_user uuid, p_event_key text, p_metadata jsonb)` looks up matching quests, upserts `user_quest_progress` to `completed`, and writes an XP ledger entry. Triggers on `profiles`, `lesson_progress`, `community_insights`, `topic_replies`, `event_attendees`, `referrals`, `marketplace_listings`, `course_enrollments` call this function for the relevant `event_key`.

UI: keep `QuestCard.tsx`. New `QuestsBoard` groups quests by category with progress rings per category. Existing `/programs/quests` page redirects into `/growth/quests`.

### Phase 2 — Platform XP

New table `xp_events` (immutable ledger):
- `id uuid pk`, `user_id uuid`, `amount int`, `source text` (quest, lesson, project, referral, community, certification, job_application), `source_id uuid null`, `metadata jsonb`, `created_at timestamptz default now()`.

Extend `profiles`: add `xp_total int default 0`, `xp_week int default 0` (rolling, refreshed by cron), `level_slug text default 'explorer'` (stub for next phase — algorithm placeholder, not exposed yet).

Trigger `tg_xp_event_aggregate` after insert on `xp_events` increments `profiles.xp_total` and `profiles.xp_week`. All XP awards go through `award_xp(user, amount, source, source_id, metadata)` security-definer function — quest completion, lesson completion, referral activation, insight posted, etc.

UI surfaces:
- New `XPBadge` component (chip with sparkline) rendered in `Navigation` (auth'd users), `ProfileView`, `StarterDashboard`/`CreatorDashboard`/`CareerDashboard`.
- `/growth` dashboard shows total XP, weekly XP, recent XP events feed, quest progress.
- `useXP()` hook reads `profiles.xp_total` + recent `xp_events`.

### Phase 4 — DIM Partner Program (referrals upgrade)

Keep `referrals` + `referral_contests`. Add:
- Columns on `referrals`: `click_count int default 0`, `first_clicked_at timestamptz`, `activated_at timestamptz`, `revenue_attributed numeric default 0`.
- New `referral_clicks` table: `id`, `referral_code text`, `user_agent`, `ip_hash`, `landing_path`, `created_at`. RLS: anon insert allowed (it's tracking), only owner/admin select.
- New `partner_stats` view (materialized refresh hourly): per user, totals of clicks, registrations (referrals.status='completed'), active users (referred user has any xp_event in last 30d), revenue.
- Ambassador qualification: SQL function `is_ambassador(user)` returns true when partner_stats meet thresholds (e.g. ≥10 active referrals OR ≥R1000 attributed revenue). Writes a row to existing `ambassador_applications` automatically.

Edge function `referral-track`: public POST that records a `referral_clicks` row when a `/r/:code` landing hits. Existing `handle_referral_signup` trigger already promotes referrals to `completed` — extend it to also call `award_xp(referrer, 100, 'referral', referral_id)`.

UI:
- Rebuild `ReferralPage` (`/programs/referral-rewards`) into `PartnerDashboard` with: share link, click→signup→active funnel, revenue, conversion %, weekly leaderboard slice, ambassador progress bar.
- Old `LoyaltyProgramsSection` referral card links to the new dashboard.

### Phase 9 — Success Wall

New table `success_stories`:
- `id`, `user_id`, `type text` (job_secured, freelance_gig, business_launched, certification_earned, revenue_milestone), `title`, `body`, `amount numeric null`, `currency text null`, `media_url text null`, `linked_id uuid null` (job/listing/cert id), `status text default 'pending'` (pending/approved/featured), `likes_count int default 0`, `created_at`.

Auto-seeding triggers:
- On `job_applications.status = 'hired'` → insert pending success_story.
- On certificate issuance (lesson_progress hits 100% for a path) → insert.
- On `marketplace_listings` first sale (later — stub now).
Manual: "Share your win" form on `/growth/success` allowing freeform submissions with media upload to existing `community-insights` bucket.

UI:
- `/growth/success` — masonry wall of approved stories, filter chips by type.
- `SuccessWallStrip` (3 latest, horizontal scroll) embedded into `CommunityPage` and `DashboardPage`.

---

### `/growth` hub structure

```text
/growth                → overview (XP, level placeholder, top quests, partner snapshot, success strip)
/growth/quests         → full quests board (replaces /programs/quests UI)
/growth/partner        → referral/partner dashboard
/growth/success        → success wall
```

Nav: add "Growth" entry to authenticated `Navigation` and `MenuPage`. Existing `/programs/*` routes keep redirects so deep links don't break.

---

### Database migrations (single transactional file)

1. `alter table public.quests add column badge_slug text, reputation_points int default 0, career_score_points int default 0, event_key text;`
2. `alter table public.profiles add column xp_total int default 0, xp_week int default 0, level_slug text default 'explorer';`
3. `create table public.xp_events (...)` + GRANT authenticated select/insert-own + service_role all + RLS (`select using auth.uid()=user_id`, no client insert — only via `award_xp`).
4. `create table public.referral_clicks (...)` + GRANT anon insert, authenticated select where referrer_user_id=auth.uid(), service_role all + RLS.
5. `create table public.success_stories (...)` + GRANT anon select where status in ('approved','featured'), authenticated insert-own + select-own + service_role all + RLS.
6. `create or replace function public.award_xp(...)` security definer.
7. `create or replace function public.award_quest_event(...)` security definer (writes user_quest_progress + calls award_xp).
8. Triggers: profile updates → onboarding quests; lesson_progress complete → learning quests; insights/topic_replies → community quests; referrals completed → growth quest + xp; event_attendees insert → community quest.
9. Materialized view `partner_stats` + refresh function.
10. Seed `quests` rows for the 5 new categories.

A separate "insert" call (not migration) seeds the quest catalog so it can be tuned post-deploy.

---

### File plan (frontend)

New:
- `src/pages/growth/GrowthHubPage.tsx`
- `src/pages/growth/QuestsBoardPage.tsx`
- `src/pages/growth/PartnerDashboardPage.tsx`
- `src/pages/growth/SuccessWallPage.tsx`
- `src/components/growth/XPBadge.tsx`
- `src/components/growth/QuestCategorySection.tsx`
- `src/components/growth/PartnerFunnelCard.tsx`
- `src/components/growth/SuccessStoryCard.tsx`
- `src/components/growth/SuccessWallStrip.tsx`
- `src/components/growth/ShareWinDialog.tsx`
- `src/hooks/useXP.tsx`
- `src/hooks/usePartnerStats.tsx`
- `src/hooks/useSuccessStories.tsx`

Edited:
- `src/App.tsx` — add `/growth/*` routes, redirect `/programs/quests` and `/programs/referral-rewards` into `/growth/*`.
- `src/components/Navigation.tsx` + `src/pages/MenuPage.tsx` — add Growth entry.
- `src/components/profile/ProfileView.tsx` — add XP/quest summary block.
- `src/pages/DashboardPage.tsx` (each tier dashboard) — embed XP badge + Success strip.
- `src/pages/CommunityPage.tsx` — embed Success strip above feed.
- `src/hooks/useMissionProgress.tsx` — keep, route XP awards through new `award_xp`.
- `src/components/loyalty/LoyaltyProgramsSection.tsx` — point referral/quest cards to new routes.

New edge function:
- `supabase/functions/referral-track/index.ts` — public click tracker.

---

### Out of scope (next plan)
Levels (Phase 3), Career Score (Phase 6), Champions rename (Phase 5), Leaderboards (Phase 7), full Profile upgrade (Phase 8), Enterprise/Business dashboard (Phase 10). XP system is built to feed all of them.

Reply "go" to implement, or tell me what to adjust.