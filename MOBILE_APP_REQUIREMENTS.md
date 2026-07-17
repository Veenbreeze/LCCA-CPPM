# Mobile App Requirements — Field & Inspector View

Requirements and build guide for a companion mobile app to Asset Lifecycle Insight (LCCA·CPPM), for **staff and inspectors** to view live asset, condition, risk, project and scenario data in the field.

> Companion reading: **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** for full endpoint/field reference. This file covers scope, requirements, screens and how the app should behave — it does not repeat every request/response shape.

---

## 📋 Table of Contents
- [Purpose](#purpose)
- [Target Users](#target-users)
- [Scope (v1)](#scope-v1)
- [Out of Scope (v1)](#out-of-scope-v1)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Information Architecture](#information-architecture)
- [Screen-by-Screen Spec](#screen-by-screen-spec)
- [Data & API Integration](#data--api-integration)
- [Visual Design Requirements](#visual-design-requirements)
- [Recommended Tech Stack](#recommended-tech-stack)
- [Environment & Networking](#environment--networking)
- [Security Requirements](#security-requirements)
- [Error & Empty States](#error--empty-states)
- [Acceptance Criteria](#acceptance-criteria)
- [Roadmap Beyond v1](#roadmap-beyond-v1)
- [Open Questions for the Backend Team](#open-questions-for-the-backend-team)

---

## Purpose

Staff and inspectors currently have no way to check asset condition, risk ranking, or capital project status without a desktop browser. This app puts a **read-only mirror of the web dashboard** in their pocket: open the app on site, look up the asset in front of them, and see its condition history, risk score, and any active project — without needing a laptop or asking someone back at the office.

## Target Users

| Persona | Needs | Device context |
|---|---|---|
| **Field Inspector** | Look up an asset on-site, check its last condition score and risk band before an inspection | Phone, outdoors, patchy signal, one-handed use |
| **Asset/Maintenance Staff** | Check which assets are highest priority, see active project status and budget | Phone or tablet, office or site |
| **Manager (secondary)** | Quick portfolio snapshot — counts by risk band, active projects — without opening the web app | Phone |

None of these users create or edit records in v1 — they consume data the web app's admins already maintain.

## Scope (v1)

A **read-only** app covering the same six resources as the web app:

1. **Dashboard** — portfolio snapshot (counts, risk bands, active projects)
2. **Assets** — browse/search, view detail (condition, criticality, lifecycle stage)
3. **Conditions** — inspection history per asset
4. **Risk** — risk score, PoF/CoF, combined score, band per asset
5. **Projects** — capital project status, budget, timeline, owner
6. **Scenarios** — repair-vs-replace NPV comparison per asset
7. **Reports** — the ranked prioritisation list; PDF/CSV export via share sheet

## Out of Scope (v1)

Explicitly **not** building these in the first version — call this out to stakeholders so scope doesn't creep:

- Creating/editing/deleting any record (no forms, no "Add Risk" etc.)
- Logging new inspections from the field (planned for v2 — see [Roadmap](#roadmap-beyond-v1))
- Photo/attachment capture (no attachment fields exist on the backend at all yet)
- Push notifications
- Offline write queue / sync conflict handling
- User self-signup (accounts are provisioned by an admin, same as the web app)

## Functional Requirements

### FR-1 — Authentication
- User logs in with username/password (`POST /api/token/`), app stores the access + refresh token securely.
- App attaches `Authorization: Bearer <access>` to every API request, even though the backend doesn't currently require it — see [Security Requirements](#security-requirements).
- On a 401, app silently retries once with `POST /api/token/refresh/`; if that also fails, user is returned to the login screen.
- Logout clears both tokens from secure storage.

### FR-2 — Dashboard
- Show total assets, count of High + Critical risk assets, active project count, and total CAPEX budget (formatted in **TSh**, matching the web app).
- Show a risk-band breakdown (Critical / High / Medium / Low) as counts or a simple chart.
- Pull-to-refresh re-fetches all summary data.

### FR-3 — Asset list & detail
- Searchable, filterable list of assets (by type, location, status, lifecycle stage) — mirrors the `?search=`/`?asset_type=`/`?location=`/`?status=`/`?lifecycle_stage=` query params.
- Asset detail screen shows: name, type, location, install date, condition rating, remaining useful life, lifecycle stage, criticality (1–5 scale) — and links out to that asset's condition history, risk record, active project(s), and scenario(s).
- Because the API returns condition/risk/project/scenario records with only a bare asset **id**, the app must cache the asset list locally and join by id to display name/location wherever those other resources are shown.

### FR-4 — Condition history
- Per-asset list of inspection records (date, score, notes), most recent first.
- Global condition list is not required for v1 — always entered from an asset's detail screen.

### FR-5 — Risk
- Show PoF (1–10), CoF (1–10), computed risk score, criticality, and combined score for the asset.
- Combined score maps to a risk band the same way the web app does: **Critical** ≥ 100, **High** ≥ 50, **Medium** ≥ 20, **Low** below that. Reuse this exact thresholding — don't invent a different one.
- A portfolio-wide risk list, sortable by combined score, should be reachable from the main nav (mirrors the web app's Risk & Prioritization page).

### FR-6 — Projects
- List of capital projects with status, budget (TSh), start/end date, responsible person.
- Filter by status and by asset.
- Detail view shows scope description in full.

### FR-7 — Scenarios
- Per-asset list of lifecycle cost scenarios showing repair cost, replacement cost, maintenance cost, discount rate, and the computed `recommended_option` ("Repair" or "Replace") with its NPV.
- Surface `recommended_option` as the headline, the four input costs as supporting detail — don't make the user compute anything.

### FR-8 — Reports
- Use `GET /api/reports/prioritisation/` to render a ranked, color-banded intervention list — this is the richest single endpoint for a mobile summary view and needs no client-side scoring logic.
- "Export" action on a report calls `GET /api/reports/{id}/export/?fmt=pdf|csv` and hands the file to the OS share sheet / a PDF viewer — don't try to render the PDF/CSV inline.

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Platforms** | iOS + Android from one codebase (see [tech stack](#recommended-tech-stack)) |
| **Performance** | Asset list with 500+ records must scroll smoothly — paginate through the API's `?page=`, don't fetch everything at once |
| **Connectivity** | Must handle no/poor signal gracefully (see [Error & Empty States](#error--empty-states)); a local cache of the last successful asset list should be shown (stale-but-available) rather than a blank screen |
| **Currency formatting** | All money values rendered in Tanzanian Shillings, e.g. `Intl.NumberFormat` with `currency: "TZS"` (React Native) or platform equivalent — matches the web app's `formatCurrency()` in `frontend/src/lib/utils.ts` |
| **Accessibility** | Minimum tap target 44×44pt, color is never the only signal for risk band (pair with a text label), respect OS text-size/dark-mode settings |
| **Localization** | English only for v1; don't hardcode strings in a way that blocks future Swahili translation |

## Information Architecture

```
Login
 └── Bottom-tab / drawer nav
      ├── Dashboard
      ├── Assets
      │    └── Asset Detail
      │         ├── Condition History
      │         ├── Risk
      │         └── Scenarios
      ├── Risk (portfolio-wide ranked list)
      ├── Projects
      │    └── Project Detail
      └── Reports
           └── Report Detail / Export
```

This mirrors the web app's sidebar (`frontend/src/layouts/AppLayout.tsx` nav sections: Overview, Asset Lifecycle, Capital Planning) so a user moving between web and mobile finds things in the same relative place.

## Screen-by-Screen Spec

| Screen | Primary data source | Key UI elements |
|---|---|---|
| Login | `POST /api/token/` | username/password fields, error message on 401 |
| Dashboard | `GET /api/assets/`, `/api/projects/`, `/api/reports/prioritisation/` (`summary`) | stat tiles, risk-band chip row |
| Asset List | `GET /api/assets/?search=&page=` | search bar, filter chips (type/location/status/stage), infinite scroll |
| Asset Detail | `GET /api/assets/{id}/` + filtered `conditions`/`risks`/`projects`/`scenarios` by `?asset={id}` | header card, tabbed or stacked sections below |
| Risk List | `GET /api/risks/?ordering=-combined_score` (client-computed if API doesn't support ordering by combined score — see note below) | sortable list, band-colored chip per row |
| Project List | `GET /api/projects/?status=&search=` | status filter, budget shown per row |
| Project Detail | `GET /api/projects/{id}/` | full scope description, timeline bar |
| Reports | `GET /api/reports/`, `/api/reports/prioritisation/` | ranked list with band chips, export button per report |

**Note:** `combined_score` is a serializer-computed field, not a real model column — the backend's `?ordering=` only accepts `probability_of_failure`/`consequence_of_failure` on `/api/risks/`. To sort by combined score, either fetch all pages and sort client-side, or ask the backend team to expose ordering by the computed field.

## Data & API Integration

- **Base URL:** `http://<server-ip>:8000/api/` in development; a real HTTPS domain in production (see [Security Requirements](#security-requirements)).
- **All six resources are paginated** (`count`/`next`/`previous`/`results`, 10 per page) except `/api/reports/` and `/api/reports/prioritisation/`, which return a raw array/object.
- **Full endpoint list, request/response field shapes, and query params:** see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
- The app should only ever call `GET` endpoints in v1 (plus the two auth `POST` endpoints) — do not wire up create/update/delete actions even though the API supports them.

## Visual Design Requirements

Match the web app's identity so the two feel like one product:

- **Primary/brand color:** the same blue used as `--primary` in `frontend/src/styles.css` (`oklch(0.42 0.16 256)` light / `oklch(0.68 0.18 254)` dark).
- **Risk band colors:** Critical/High → destructive red, Medium → warning amber, Low → success green — same semantic mapping as the web app's `levelVariant()` (see `frontend/src/routes/risk.tsx`).
- **Currency:** always `TSh` prefix with thousands separators, never a bare `$`.
- **Dark mode:** support it — the web app already ships a light/dark theme toggle; the mobile app should follow the OS setting at minimum.
- **Typography/spacing:** doesn't need to be pixel-identical to the web app, but should read as the same brand — clean, data-dense, minimal decoration (this is a utility tool for people in the field, not a marketing app).

## Recommended Tech Stack

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **React Native (Expo)** | Team already knows React/TypeScript from the web app (`frontend/`); serializer field names and currency/risk-band logic can be near-copy-pasted |
| Navigation | React Navigation (bottom tabs + native stack) | Standard, well-supported |
| Data fetching & caching | TanStack Query (React Query) | Handles pagination, caching, retry, and stale-while-revalidate for the offline-tolerant list screens for free |
| Local storage | `expo-secure-store` for tokens; AsyncStorage or MMKV for cached list data | Tokens must not sit in plain AsyncStorage |
| HTTP client | `axios`, mirroring `frontend/src/services/api.ts`'s interceptor pattern for attaching the bearer token | Reuse the same request/response shape assumptions as the web app |

If the team prefers Flutter or native Kotlin/Swift instead, the requirements above are framework-agnostic — only the "Recommended Tech Stack" table changes.

## Environment & Networking

- Development: backend must run with `python manage.py runserver 0.0.0.0:8000`, the dev machine's LAN IP added to `ALLOWED_HOSTS`, and the firewall open on port 8000 — see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#getting-started) for the full checklist.
- CORS is irrelevant to a native app (it's a browser-only mechanism) — don't spend time configuring it for the mobile client.
- Plain HTTP in dev will be blocked by default on-device: add an Android `network_security_config.xml` cleartext exception / iOS ATS exception scoped to the dev IP only, and remove it from production builds.
- Production needs a real HTTPS endpoint before this app goes to a store or to real inspectors — do not ship a production build pointed at plain HTTP.

## Security Requirements

- **Store tokens in the platform secure keystore** (Keychain/Keystore via `expo-secure-store` or equivalent), never in plain AsyncStorage/localStorage-equivalent.
- **Always send the bearer token**, even though the backend's resource endpoints are currently `AllowAny` — this is a known gap on the backend (see [Open Questions](#open-questions-for-the-backend-team)) and the app must not depend on staying unauthenticated.
- **No hardcoded credentials or tokens** in the app bundle.
- Because there is no user-role information returned by the API, do not attempt to hide/show features based on a "role" the app cannot actually verify — that enforcement has to happen server-side once it exists.

## Error & Empty States

| Situation | Required behavior |
|---|---|
| No network | Show cached data (if any) with a "last updated" timestamp and an offline banner; never show a blank white screen |
| 401/expired token | Attempt one silent refresh, then bounce to login with a "session expired" message |
| 404 on asset detail | "This asset may have been removed" message with a back action |
| Empty list (e.g. no conditions logged yet) | A plain-language empty state ("No inspections logged for this asset yet"), not just an empty screen |
| Report export failure | Toast/snackbar with retry — remember `/api/reports/{id}/export/` returns **plain text**, not JSON, on a bad id, so don't blindly `JSON.parse()` every error body |

## Acceptance Criteria

The v1 app is done when:

- [ ] A staff/inspector can log in and stay logged in across app restarts (token persisted securely, refreshed silently)
- [ ] Every screen in [Screen-by-Screen Spec](#screen-by-screen-spec) is implemented and shows live data from the API
- [ ] Asset search/filtering works and paginates correctly through large asset lists
- [ ] Risk bands and currency are formatted identically in meaning (if not pixel) to the web app
- [ ] The app works (read cached data, doesn't crash) when the network drops mid-session
- [ ] A report can be exported and opened/shared as a PDF or CSV file
- [ ] No create/update/delete UI exists anywhere in the app (out of scope for v1)
- [ ] Runs on both iOS and Android from the same codebase

## Roadmap Beyond v1

Not required now — listed so scope decisions in v1 don't accidentally block these later:

1. **v2 — Field data entry:** let inspectors submit new `Condition` records from the app (the `POST /api/conditions/` endpoint already exists and supports this).
2. **v3 — Photo attachments:** requires a backend change first (no file/image field exists on any model today).
3. **v4 — Push notifications:** for new high-risk assets or project status changes; no notifications backend exists yet.
4. **v5 — Offline write queue:** only relevant once the app writes data (v2+).

## Open Questions for the Backend Team

Raise these before/during the build — they don't block starting, but they shape decisions above:

1. All resource endpoints are `AllowAny` today — confirm if/when `IsAuthenticated` will be enforced, since the app is built to expect it eventually.
2. No `/api/me/` (current-user) endpoint exists — the app can't show "logged in as ___" without decoding the JWT client-side.
3. `?ordering=` on `/api/risks/` doesn't support the computed `combined_score` field — needed for a proper portfolio risk ranking screen without client-side sorting of every page.
4. No file/photo field exists on any model — blocks the v3 roadmap item above.
5. No notifications endpoints exist — blocks the v4 roadmap item above.
