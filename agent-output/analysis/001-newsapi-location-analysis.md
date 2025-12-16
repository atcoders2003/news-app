# NewsAPI + Location Analysis

**Date**: 2025-12-15
**Author**: Analyst agent
**Related Plan**: agent-output/planning/v0.1.0-newsapp-implementation-plan.md

## Value Statement and Business Objective
As a product team, we want to use NewsAPI free-tier and a single request per user-selected topic so that we can deliver relevant headlines while staying within quota and keeping the MVP simple.

## Scope
- Evaluate technical fit of NewsAPI for the MVP (free tier, single-request-per-topic strategy)
- Recommend best practice for location filtering and fallback behavior
- Identify operational risks and mitigations (rate limits, key exposure, CORS)

## Methodology
- Review NewsAPI capabilities and common integration patterns (top-headlines, everything endpoints, query parameters)
- Validate constraints introduced by free-tier usage and single-request-per-topic strategy
- Produce concrete recommendations for fetch strategy, caching, and location handling

## Findings
- Free-tier strategy (single request per selected topic): viable for small-scale MVP and low daily active users if each selected topic triggers only one request per session/load. This approach significantly reduces call volume compared to polling or per-card requests.
- Location filtering: NewsAPI provides country and category/top-headlines filters which work well for country-level localization. City-level localization is not directly supported by NewsAPI; implementer should either:
  - map user city to a broader region/country and use the `country` parameter, or
  - use keyword queries (`q`) including city/place names for narrower results (less reliable and may miss results).
- CORS & API key exposure: NewsAPI supports client-side calls, but embedding the API key in public builds risks exposure. Local dev may use `.env` placeholders, but production builds should use a server-side or serverless proxy to hide the key and apply shared caching.
- Rate limiting & quotas: free-tier limits vary and should be confirmed on the NewsAPI dashboard. Assume conservative behavior: treat quota errors as a likely occurrence and implement clear fallback UI and caching. Do not rely on real-time retries that exceed quotas.
- Deduplication & aggregation: Aggregating results across multiple topic requests will produce overlap; implement dedupe by article `url` or title to avoid repeated cards.

## Recommendations
1. Fetch strategy: For each user-selected topic, issue a single `top-headlines` or `everything` request (depending on desired recency/freshness) and aggregate results into one feed. Limit per-topic page size to avoid extra calls.
2. Caching: Store fetched results in IndexedDB with timestamps. Serve cached results first on load while refreshing in background (respect single-request-per-topic policy). Retain cached items for at least 24 hours.
3. Location handling: Use `country` param for country-level preferences. If user selects city-level location, translate city → country as the primary filter and optionally add city name to `q` for narrower results.
4. Key protection: Use a serverless proxy for production (Vercel Serverless / Netlify Functions) to keep the key secret and provide a shared cache. For local dev, use `.env` with a placeholder key and explicit README instructions.
5. Error handling: Detect quota errors and show a friendly UI message while serving cached content. Implement exponential backoff and do not retry aggressively on quota errors.
6. Deduplication: Remove duplicates by article `url` before rendering cards.

## Acceptance Criteria for Analysis
- Confirmation that single-request-per-topic returns sufficient coverage for user-selected topics during manual testing (sample 5 topics).
- Location fallback behavior validated for at least country-level and one city-level sample.

## Open Questions
- What expected daily active users should we assume to size caching and decide when to move to a paid plan? (Planner/PM input)
- Should we standardize on `top-headlines` for lower API cost and better locality, or use `everything` for broader coverage? (Product decision)

---

Saved progress to Flowbaby memory.
