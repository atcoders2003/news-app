# News App — Architecture Findings (Design Fit Review)

**Date**: 2025-12-15
**Reviewer**: Architect agent
**Related Artifacts**:
- Roadmap: [agent-output/roadmap/product-roadmap.md](agent-output/roadmap/product-roadmap.md)
- Plan: [agent-output/planning/v0.1.0-newsapp-implementation-plan.md](agent-output/planning/v0.1.0-newsapp-implementation-plan.md)
- Analysis: [agent-output/analysis/001-newsapi-location-analysis.md](agent-output/analysis/001-newsapi-location-analysis.md)

## Summary
I reviewed the roadmap, implementation plan, and analysis for the MVP. Overall the proposed design (React+Vite frontend, single-request-per-topic NewsAPI approach, IndexedDB caching) fits the stated product goals for an early MVP. The approach is pragmatic and minimizes external dependencies.

## Verdict
APPROVED_WITH_CHANGES

## Required Changes (must be addressed before production deploy)
1. API Key Protection: For production, **MUST** use a serverless proxy (Vercel/Netlify functions or simple API) to keep the NewsAPI key secret and provide shared caching. Document the proxy contract in an ADR.
2. Caching & TTL: Define explicit caching TTLs and eviction behavior in an ADR (recommended 24h retention for cached headlines). Implement deduplication by `url`.
3. Error Classification: Implement an error taxonomy and UX flows for quota errors vs transient network failures; add exponential backoff and UI messaging.
4. Monitoring & Quota Alerts: Add basic monitoring and alerts for API errors and proxy cache hit/miss ratios to avoid silent quota exhaustion.

## Recommendations (implementation-level guidance)
- Fetch orchestration: Frontend should call a single proxy endpoint that can accept multiple topics and return aggregated, deduplicated results. If proxy not used in dev, enforce `.env` usage and document risk.
- Location handling: Use `country` param for country-level preferences and fall back to keyword `q` for city-level when necessary (analysis already recommends this).
- Deduplication: De-duplicate by `url`; if `url` absent, use title+source fingerprint.
- Accessibility: Provide non-gesture controls (next/prev buttons, keyboard support) and ensure double-tap alternative for accessibility.

## Risks
- Key leakage if proxy is not used in production.
- Free-tier quotas may be exceeded under even moderate usage; caching and aggregation are critical.

## Next Steps
1. Create ADR: `agent-output/architecture/adr-0001-serverless-proxy.md` capturing proxy API contract and caching policy.
2. Planner: Update implementation plan to reference ADRs and include acceptance criteria for proxy and caching.
3. Implementer: Proceed with frontend scaffold but use placeholder `.env` keys for local dev; do not commit secrets.

---

Saved progress to Flowbaby memory.
