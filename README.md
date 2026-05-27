# 🧙 Lodge Wiz - Listing Recommendation App

A personalized Airbnb recommendation engine built as a multi-step preference quiz.
Users answer a few questions and get ranked listings that match their criteria, with explanations for why each one matched.

---

## Getting Started

```bash
npm install
npm run seed       # seed the database with 30 listings
npm run dev        # start the dev server at localhost:3000
```

Set up your `.env` file:
```
DATABASE_URL=your_supabase_session_pooler_url
DATABASE_URL_UNPOOLED=your_supabase_session_pooler_url
```

**Routes:**
- `/` — preference quiz
- `/results?sessionId=...` - recommendation results
- `/admin` - ops/admin dashboard

---

## Stack

- **React + Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Drizzle ORM**
- **Supabase** (hosted Postgres)

---

## Questions I'd Ask the Team

If this were a real project, I'd want answers to these before building:

**1. Who is the primary user — guests or hosts?**
I assumed guests searching for listings. If the primary user is a host managing their own properties, the quiz flow and scoring logic would look very different. 

**2. Should recommendations be personalized over time?**
Right now each quiz submission is anonymous and stateless. If users have accounts, we could learn from past searches and improve recommendations over time. I'd want to know if auth is on the roadmap before finalizing the session/recommendation schema.

**3. What does "on hold" mean operationally?**
I interpreted it as temporarily unavailable - the listing still exists in history but shouldn't appear in new results. I'd want to confirm whether on-hold listings should be completely hidden from past recommendation views, or just flagged as unavailable (I chose the latter).

**4. How should scoring weights be determined?**
I hardcoded weights based on intuition (location and budget at 25% each, guests at 20%, etc.). In a real product, these would ideally be informed by data - what attributes correlate most with a user booking after viewing a result? I'd want to run that analysis before locking in weights. Or perhaps even assign weights
dynamically after asking the users what's most important to them. 

**5. Should the quiz be adaptive?**
If a user selects "cabin in the mountains," subsequent questions could be pre-filtered to only show relevant options. I built a linear flow for simplicity, but the step-by-step architecture is already set up to support conditional logic.

**6. What's the expected listing volume?**
My current scorer fetches all active listings and scores them in memory. This works well up to a few thousand listings. At scale, I'd want to know whether a pre-filtering step (coarse SQL filter before fine TypeScript scoring) is needed.

**7. What are the target concurrency metrics and traffic patterns?**
I'd want to know if traffic is steady or highly spiky (e.g., flash marketing drops). Right now, the quiz submission triggers an on-demand calculation loop and writes to the Postgres database immediately. If we expect thousands of concurrent quiz submissions per second, this architecture could bottleneck connection pools or overwhelm database write capacities. Knowing the target scale tells me if we need to offload quiz parsing to edge functions, introduce Redis caching for available listings, or use a message queue (like RabbitMQ or BullMQ) to handle high-throughput recommendation writes asynchronously.

---

## Assumptions I Made

**Location is a hard constraint, not a preference.**
I filter out non-matching locations before scoring entirely. A listing in Chicago should never appear in results for someone who selected New York, regardless of how well it matches on other dimensions.

**Budget is a gradient, not a binary.**
A listing at $80 on a $150 budget scores higher than one at $145 - better value for money. I assumed a 15% soft buffer zone. If a listing is slightly over-budget but perfect on vibes and amenities, it stays alive but gets penalized heavily in scoring. If it's more than 15% over, it is strictly filtered out.

**Recommendations are immutable records.**
Once a recommendation is saved, I don't update it when listing data changes. Instead, I snapshot the attributes that affected the score (`priceAtMatch`, `ratingAtMatch`) at match time. If the current price differs from the match price, the results page surfaces a "price changed" warning. This makes the historical record honest without duplicating the entire listing. The only exception to this is the isInvalidated field that gets updated when a listing that's been recommended goes on_hold, as required by the spec. 

**A quiz submission produces exactly one recommendation set.**
There's no concept of re-running the same preferences against new listings. If a user wants fresh results, they retake the quiz. Each submission gets a UUID-based URL (`/results?sessionId=...`) that acts as a shareable permalink - no auth required.

**Amenities and vibes use separate junction tables.**
Rather than storing them as arrays or JSONB on the listings row, I used `listing_amenities` and `listing_vibes` junction tables. This makes scoring clean (set intersection via joins), keeps the schema normalized, and makes it trivial to add new amenities or vibes without a migration.

**Property type and vibe are optional preferences.**
Not every user cares about property type or vibe - forcing an answer adds friction. Unanswered optional questions contribute a neutral score (1.0) rather than penalizing listings.

**Database timezones must be globally bulletproof.**
I assumed the system will scale across cloud regions (Vercel Edge, AWS nodes). Therefore, I configured Drizzle to explicitly use timestamp({ withTimezone: true }) (TIMESTAMPTZ in Postgres) to ensure all matching metrics are written uniformly in UTC, pushing localized formatting entirely to the client's browser locale.

---

## Tradeoffs I Made

**Deterministic scorer over LLM**
The match explanation (`"87% match — great value at $120/night, has all your must-have amenities"`) is generated deterministically from the score breakdown rather than via an LLM call. This keeps the scorer fast, free, testable, and always available. The `generateExplanation` function in `scorer.ts` is a single-function swap if LLM explanations are wanted - it would receive the same breakdown object and return richer prose. The main reason being that if we used LLMs to score/rate listings, when we have 1M+ listings, for each quiz, we'd have that 1M+ calls to the LLM, which is expensive and inefficient. Instead of that, I would opt for using LLMs to generate the match explanation because we only need that for the top K results that we're displaying. 

**Eager scoring over lazy scoring**
I score all listings at submission time rather than on-demand when the results page loads. This means results are fast to display (no scoring delay on page load) and the historical record is a true snapshot. The tradeoff is that new listings added after submission won't appear in those results - which I think is the right behavior for a recommendation (it's a record of what matched at that moment).

**Session pooler over direct Postgres connection**
Supabase's direct connection requires IPv6, which isn't universally supported. I used the session pooler (port 5432) for migrations and the transaction pooler (port 6543) for the app. This adds a small layer of indirection but makes the app work on any network.

**Inline styles for the admin page**
The admin UI uses inline style objects rather than Tailwind or a CSS file. This keeps it self-contained and fast to write - the spec explicitly said the admin can be simple. The quiz and results UI use a proper CSS design system.

---

## What I'd Improve With More Time

**1. LLM-generated match explanations**
The architecture is ready for it. `generateExplanation` in `scorer.ts` would be replaced with a single Vercel AI SDK call passing the score breakdown and listing description. The scoring logic itself wouldn't change at all.

**2. Adaptive quiz**
Questions could respond to prior answers - if a user selects a city with only apartments and lofts, the property type step would filter accordingly. The step-by-step wizard architecture already supports this.

**3. User accounts and recommendation history**
Right now sessions are anonymous. Adding auth would mean associating `quiz_sessions` with a `user_id`. Users could then see their full search history and we could start learning from their behavior.

**4. Scoring weight optimization**
The current weights are intuition-based. With real booking data, I'd analyze which attributes correlate most strongly with a user clicking through or booking after seeing a result, and adjust weights accordingly. The weight constants are isolated in `constants.ts` - updating them is a one-line change.

**5. Pre-filtering at scale**
At thousands of listings, scoring everything in memory becomes expensive. The natural next step is a two-phase approach: a SQL pre-filter that eliminates hard mismatches (wrong city, over budget, too few guests), followed by the TypeScript scorer running on the reduced set.

**6. Price change notifications**
If a user bookmarked a result and the price later dropped into their budget, they'd want to know. This would require a background job comparing current listing prices against historical `priceAtMatch` values and notifying users via email.

**7. Amenity and vibe weights**
Currently all amenities are weighted equally. In reality, WiFi is a near-universal requirement while a gym is a nice-to-have. The quiz could let users mark amenities as "must have" vs "nice to have," and the scorer could apply a multiplier accordingly.

**8. More attributes for Airbnb listings**
Currently, I only display a limited number of attributes for Airbnb listings. However, getting/storing/display images, videos, and user reviews would be the next natural step. 

**9. Database indexing**
Right now, since the number of data points I have in my tables is quite small and given the time constraints, indexing isn't required. However, as the data scales and we get 100k+ rows in our listing table, to help improve the speed of queries, it would make sense to have indexes set up. For example, for the joins or the where clauses or even the columns with the most number of unique items.
