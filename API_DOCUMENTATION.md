# API Documentation

Complete reference for all API endpoints in Asset Lifecycle Insight.

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Assets API](#assets-api)
- [Conditions API](#conditions-api)
- [Risks API](#risks-api)
- [Projects API](#projects-api)
- [Scenarios API](#scenarios-api)
- [Reports API](#reports-api)
- [Pagination](#pagination)
- [Filtering & Search](#filtering--search)

---

## Getting Started

### Base URL
```
http://localhost:8000/api
```

### API Version
- **Current:** v1 (implicit)
- **Format:** RESTful JSON API

### Response Type
All responses are in JSON format.

---

## Authentication

**Current Status:** ✅ No authentication required (AllowAny permissions)

All resource endpoints (`assets`, `conditions`, `risks`, `projects`, `scenarios`, `reports`) are
publicly accessible — no API key or token required, and no `Authorization` header is checked.

JWT token endpoints exist (via `rest_framework_simplejwt`) but are **not currently enforced** by
any view:

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/token/` | `{"username", "password"}` | `{"access", "refresh"}` |
| POST | `/api/token/refresh/` | `{"refresh"}` | `{"access"}` |

---

## Response Format

### Successful Response (200 OK)

**Paginated List:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/assets/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Asset Name",
      "...": "other fields"
    }
  ]
}
```

**Direct List (Non-paginated):**
```json
[
  {
    "id": 1,
    "name": "Item Name",
    "...": "other fields"
  }
]
```

**Single Object:**
```json
{
  "id": 1,
  "name": "Item Name",
  "...": "other fields"
}
```

### Error Response (400/404/500)

```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE"
}
```

Or for field errors:
```json
{
  "field_name": [
    "This field is required."
  ]
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Backend error |

### Example Error Responses

**404 Not Found:**
```bash
curl http://localhost:8000/api/assets/9999/

# Response:
{
  "detail": "Not found."
}
```

**400 Bad Request:**
```bash
curl -X POST http://localhost:8000/api/assets/ \
  -H "Content-Type: application/json" \
  -d '{"asset_type": "Invalid"}'

# Response:
{
  "name": ["This field is required."],
  "asset_type": ["Invalid choice."]
}
```

---

## Assets API

Manage physical and digital assets in the portfolio.

### List Assets

**Request:**
```http
GET /api/assets/
```

**Response:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Boiler A-12",
      "asset_type": "Mechanical",
      "location": "Building B, Floor 3",
      "installation_date": "2015-01-15",
      "condition_rating": "3.5",
      "remaining_useful_life": 5,
      "status": "Operational",
      "lifecycle_stage": "renewal",
      "criticality": "3.0"
    },
    {
      "id": 2,
      "name": "Electrical Panel 02",
      "asset_type": "Electrical",
      "location": "Building A, Basement",
      "installation_date": "2010-06-20",
      "condition_rating": "2.5",
      "remaining_useful_life": 3,
      "status": "Maintenance",
      "lifecycle_stage": "replacement",
      "criticality": "4.0"
    }
  ]
}
```

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | read-only |
| `name` | string | |
| `asset_type` | string | |
| `location` | string | |
| `installation_date` | date | |
| `condition_rating` | decimal (1 dp) | 1.0–5.0 by convention, not server-enforced |
| `remaining_useful_life` | int | years |
| `status` | string | free text, e.g. `Operational`, `Maintenance` |
| `lifecycle_stage` | string | one of `renewal`, `replacement`, `refurbishment`, `expansion` (default `renewal`) |
| `criticality` | decimal (1 dp) | 1.0–5.0 by convention, default `1.0`; read by the Risk endpoints |

### Get Single Asset

**Request:**
```http
GET /api/assets/{id}/
```

**Example:**
```bash
curl http://localhost:8000/api/assets/1/
```

**Response:**
```json
{
  "id": 1,
  "name": "Boiler A-12",
  "asset_type": "Mechanical",
  "location": "Building B, Floor 3",
  "installation_date": "2015-01-15",
  "condition_rating": "3.5",
  "remaining_useful_life": 5,
  "status": "Operational",
  "lifecycle_stage": "renewal",
  "criticality": "3.0"
}
```

### Create Asset

**Request:**
```http
POST /api/assets/
Content-Type: application/json
```

**Body:**
```json
{
  "name": "HVAC System 01",
  "asset_type": "Mechanical",
  "location": "Building C, Rooftop",
  "installation_date": "2018-03-10",
  "condition_rating": 4.0,
  "remaining_useful_life": 7,
  "status": "Operational",
  "lifecycle_stage": "renewal",
  "criticality": 2.0
}
```

**Response:** (201 Created)
```json
{
  "id": 3,
  "name": "HVAC System 01",
  "asset_type": "Mechanical",
  "location": "Building C, Rooftop",
  "installation_date": "2018-03-10",
  "condition_rating": "4.0",
  "remaining_useful_life": 7,
  "status": "Operational",
  "lifecycle_stage": "renewal",
  "criticality": "2.0"
}
```

### Update Asset

**Request:**
```http
PUT /api/assets/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "condition_rating": 3.5,
  "status": "Maintenance"
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "name": "Boiler A-12",
  "asset_type": "Mechanical",
  "location": "Building B, Floor 3",
  "installation_date": "2015-01-15",
  "condition_rating": "3.5",
  "remaining_useful_life": 5,
  "status": "Maintenance",
  "lifecycle_stage": "renewal",
  "criticality": "3.0"
}
```

### Delete Asset

**Request:**
```http
DELETE /api/assets/{id}/
```

**Response:** (204 No Content)
```
(empty response)
```

---

## Conditions API

Track asset condition inspections over time. There is no `inspector` field — the model only
tracks the asset, inspection date, score, and free-text notes.

### List Conditions

**Request:**
```http
GET /api/conditions/
```

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "asset": 1,
      "inspection_date": "2025-04-22",
      "condition_score": "3.5",
      "notes": "Normal wear and tear observed"
    }
  ]
}
```

### Get Condition by ID

**Request:**
```http
GET /api/conditions/{id}/
```

### Create Condition

**Request:**
```http
POST /api/conditions/
Content-Type: application/json
```

**Body:**
```json
{
  "asset": 1,
  "inspection_date": "2025-04-22",
  "condition_score": 3.5,
  "notes": "Normal wear and tear observed"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "asset": 1,
  "inspection_date": "2025-04-22",
  "condition_score": "3.5",
  "notes": "Normal wear and tear observed"
}
```

### Update Condition

**Request:**
```http
PUT /api/conditions/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "condition_score": 3.0,
  "notes": "Updated assessment"
}
```

### Delete Condition

**Request:**
```http
DELETE /api/conditions/{id}/
```

---

## Risks API

Manage risk assessments using a Probability × Consequence matrix. Each asset has **at most one**
risk record — `asset` is a one-to-one relationship, not a foreign key.

### List Risks

**Request:**
```http
GET /api/risks/
```

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "asset": 1,
      "probability_of_failure": "2.5",
      "consequence_of_failure": "4.0",
      "computed_risk_score": 10.0,
      "criticality": "3.0",
      "combined_score": 30.0
    }
  ]
}
```

### Get Risk by ID

**Request:**
```http
GET /api/risks/{id}/
```

### Create Risk Assessment

**Request:**
```http
POST /api/risks/
Content-Type: application/json
```

**Body:**
```json
{
  "asset": 1,
  "probability_of_failure": 2.5,
  "consequence_of_failure": 4.0
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "asset": 1,
  "probability_of_failure": "2.5",
  "consequence_of_failure": "4.0",
  "computed_risk_score": 10.0,
  "criticality": "3.0",
  "combined_score": 30.0
}
```

**Notes:**
- `probability_of_failure` / `consequence_of_failure`: decimal, no server-side range enforcement
  (used as 1-5 / 1-10 scales by convention only)
- `computed_risk_score` (read-only): `probability_of_failure × consequence_of_failure`
- `criticality` (read-only): copied from the related asset's `criticality`
- `combined_score` (read-only): `computed_risk_score × criticality` — used for intervention
  prioritisation. Band thresholds: Critical ≥100, High ≥50, Medium ≥20, else Low.

### Update Risk

**Request:**
```http
PUT /api/risks/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "probability_of_failure": 3.0,
  "consequence_of_failure": 4.5
}
```

### Delete Risk

**Request:**
```http
DELETE /api/risks/{id}/
```

---

## Projects API

Manage capital projects and track budget/status. There is **no `spent` field** — only a single
`budget` amount is tracked. `end_date` is required (not nullable).

### List Projects

**Request:**
```http
GET /api/projects/
```

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "name": "Boiler Replacement Project",
      "asset": 1,
      "scope_description": "Full replacement of primary boiler unit.",
      "budget": "50000.00",
      "start_date": "2025-01-15",
      "end_date": "2025-09-30",
      "status": "Active",
      "responsible_person": "Jane Doe"
    }
  ]
}
```

### Get Project by ID

**Request:**
```http
GET /api/projects/{id}/
```

### Create Project

**Request:**
```http
POST /api/projects/
Content-Type: application/json
```

**Body:**
```json
{
  "name": "HVAC System Replacement",
  "asset": 3,
  "scope_description": "Replace rooftop HVAC unit and controls.",
  "budget": 75000,
  "start_date": "2025-06-01",
  "end_date": "2025-12-15",
  "status": "Planning",
  "responsible_person": "Jane Doe"
}
```

**Response:** (201 Created)
```json
{
  "id": 2,
  "name": "HVAC System Replacement",
  "asset": 3,
  "scope_description": "Replace rooftop HVAC unit and controls.",
  "budget": "75000.00",
  "start_date": "2025-06-01",
  "end_date": "2025-12-15",
  "status": "Planning",
  "responsible_person": "Jane Doe"
}
```

### Update Project

**Request:**
```http
PUT /api/projects/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Completed",
  "end_date": "2025-11-30"
}
```

### Delete Project

**Request:**
```http
DELETE /api/projects/{id}/
```

---

## Scenarios API

Analyze lifecycle cost scenarios (repair vs replacement, discounted over the asset's remaining
useful life). There is **no `computed_npv` field** — the real computed fields are `npv`,
`repair_npv`, `replacement_npv`, `lifecycle_cost`, `recommended_option`, and `horizon_years`, all
read-only and derived from the asset every time the record is serialized.

### List Scenarios

**Request:**
```http
GET /api/scenarios/
```

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "asset": 1,
      "repair_cost": "5000.00",
      "replacement_cost": "25000.00",
      "maintenance_cost": "1000.00",
      "discount_rate": "5.00",
      "npv": 9329.48,
      "repair_npv": 9329.48,
      "replacement_npv": 27164.74,
      "lifecycle_cost": 9329.48,
      "recommended_option": "Repair",
      "horizon_years": 5
    }
  ]
}
```

### Get Scenario by ID

**Request:**
```http
GET /api/scenarios/{id}/
```

### Create Scenario

**Request:**
```http
POST /api/scenarios/
Content-Type: application/json
```

**Body:**
```json
{
  "asset": 1,
  "repair_cost": 5000,
  "replacement_cost": 25000,
  "maintenance_cost": 1000,
  "discount_rate": 5
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "asset": 1,
  "repair_cost": "5000.00",
  "replacement_cost": "25000.00",
  "maintenance_cost": "1000.00",
  "discount_rate": "5.00",
  "npv": 21598.36,
  "repair_npv": 26598.36,
  "replacement_npv": 27299.18,
  "lifecycle_cost": 26598.36,
  "recommended_option": "Repair",
  "horizon_years": 5
}
```

**Notes:**
- `discount_rate` is an annual percentage (e.g. `5.0` for 5%), not a fraction.
- `horizon_years`: the related asset's `remaining_useful_life` (minimum 1).
- `repair_npv`: `repair_cost` at year 0 plus `maintenance_cost` discounted annually over
  `horizon_years`.
- `replacement_npv`: `replacement_cost` at year 0 plus half of `maintenance_cost` discounted
  annually over `horizon_years`.
- `lifecycle_cost` / `npv`: the lower of `repair_npv` and `replacement_npv` (both fields return the
  same value).
- `recommended_option`: `"Replace"` if `replacement_npv < repair_npv`, otherwise `"Repair"`.

### Update Scenario

**Request:**
```http
PUT /api/scenarios/{id}/
Content-Type: application/json
```

**Body:**
```json
{
  "maintenance_cost": 1500,
  "discount_rate": 6
}
```

### Delete Scenario

**Request:**
```http
DELETE /api/scenarios/{id}/
```

---

## Reports API

Generate and export reports. There are **4** report definitions (not 3), and there is **no**
`GET /api/reports/{id}/` detail route — the `ReportViewSet` never defines `retrieve`, so that URL
returns `404`. Only `list`, `prioritisation`, and `export` exist.

### List Reports

**Request:**
```http
GET /api/reports/
```

Not paginated — always returns a plain array. `updated` is always today's date (computed at
request time, not stored per-report).

**Response:**
```json
[
  {
    "id": 1,
    "title": "Asset Lifecycle Report",
    "description": "Full inventory with condition, RUL, lifecycle stage and criticality.",
    "updated": "2026-07-06"
  },
  {
    "id": 2,
    "title": "CAPEX Analysis",
    "description": "Budget vs spend across all capital projects.",
    "updated": "2026-07-06"
  },
  {
    "id": 3,
    "title": "Risk Register",
    "description": "Ranked risk register with PoF/CoF scoring and criticality.",
    "updated": "2026-07-06"
  },
  {
    "id": 4,
    "title": "Intervention Prioritisation",
    "description": "Ranked interventions by (risk × criticality) / RUL with recommended action.",
    "updated": "2026-07-06"
  }
]
```

### Get Prioritisation Data

Returns the same ranked intervention data used by report `4`'s export, as JSON — useful for a
dashboard/summary view instead of a file download.

**Request:**
```http
GET /api/reports/prioritisation/
```

**Response:**
```json
{
  "summary": {
    "total": 12,
    "critical": 2,
    "high": 3,
    "medium": 4,
    "low": 3
  },
  "results": [
    {
      "risk_id": 1,
      "asset_id": 1,
      "asset_name": "Boiler A-12",
      "asset_type": "Mechanical",
      "location": "Building B, Floor 3",
      "lifecycle_stage": "renewal",
      "recommended_intervention": "Replacement",
      "remaining_useful_life": 5,
      "probability_of_failure": 2.5,
      "consequence_of_failure": 4.0,
      "criticality": 3.0,
      "risk_score": 10.0,
      "combined_score": 30.0,
      "urgency_score": 6.0,
      "band": "Medium",
      "rank": 1
    }
  ]
}
```

**Notes:**
- Sorted by `urgency_score` descending (`combined_score / remaining_useful_life`).
- `recommended_intervention` is derived from the asset's condition/RUL — not the same field as
  `lifecycle_stage`.

### Export Report

**Request:**
```http
GET /api/reports/{id}/export/?fmt={format}
```

Only valid for report IDs `1`–`4`; any other ID returns a plain-text `404` body (not JSON).

**Parameters:**
- `fmt` (or `format`, both accepted): `pdf` (default) or `csv`

**Examples:**

**PDF Export:**
```bash
curl -X GET "http://localhost:8000/api/reports/1/export/?fmt=pdf" \
  -H "Accept: application/pdf" \
  -o report.pdf
```

**CSV Export:**
```bash
curl -X GET "http://localhost:8000/api/reports/1/export/?fmt=csv" \
  -H "Accept: text/csv" \
  -o report.csv
```

---

## Pagination

### Request

```http
GET /api/assets/?page=2&page_size=50
```

### Parameters

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `page` | integer | 1 | N/A |

**`page_size` is not supported.** The API uses plain DRF `PageNumberPagination` with
`PAGE_SIZE = 10` and no `page_size_query_param` configured, so every paginated list returns 10
results per page regardless of query string — passing `?page_size=` has no effect. (This applies
to `assets`, `conditions`, `risks`, `projects`, `scenarios` — `reports` is not paginated.)

### Response

```json
{
  "count": 25,
  "next": "http://localhost:8000/api/assets/?page=2",
  "previous": "http://localhost:8000/api/assets/?page=1",
  "results": [...]
}
```

**Notes:**
- `count`: Total items across all pages
- `next`: URL of next page (null if last page)
- `previous`: URL of previous page (null if first page)

---

## Filtering & Search

Per-resource filter/search/ordering fields, straight from each `ViewSet`:

| Resource | `filterset_fields` (exact-match) | `search_fields` | `ordering_fields` |
|---|---|---|---|
| assets | `asset_type`, `location`, `status`, `lifecycle_stage` | `name`, `asset_type`, `location`, `status`, `lifecycle_stage` | `installation_date`, `remaining_useful_life`, `condition_rating`, `criticality` |
| conditions | `asset`, `inspection_date` | `asset__name`, `notes` | `inspection_date`, `condition_score` |
| risks | `asset` | `asset__name` | `probability_of_failure`, `consequence_of_failure` |
| projects | `asset`, `status`, `start_date`, `end_date` | `name`, `responsible_person`, `status` | `start_date`, `end_date`, `budget` |
| scenarios | `asset`, `discount_rate` | `asset__name` | `repair_cost`, `replacement_cost`, `maintenance_cost` |

Note there is **no server-side ordering by `computed_risk_score` or `combined_score`** on
`/api/risks/` — sort those client-side after fetching.

### Search (Full-Text)

**Request:**
```bash
GET /api/assets/?search=boiler
GET /api/conditions/?search=leak
```

### Field Filtering

**Request:**
```bash
GET /api/assets/?asset_type=Mechanical
GET /api/assets/?status=Operational
GET /api/projects/?status=Active
GET /api/risks/?asset=1
```

`filterset_fields` entries default to exact match; date fields (`inspection_date`, `start_date`,
`end_date`) also support Django's standard lookup suffixes:

**Request:**
```bash
GET /api/conditions/?inspection_date=2025-04-22
GET /api/conditions/?inspection_date__gte=2025-01-01
GET /api/conditions/?inspection_date__lte=2025-12-31
```

**Available Date Filters:**
- `__exact` - Exact match
- `__gte` - Greater than or equal
- `__lte` - Less than or equal
- `__gt` - Greater than
- `__lt` - Less than

### Ordering

**Request:**
```bash
GET /api/assets/?ordering=name
GET /api/assets/?ordering=-condition_rating
GET /api/risks/?ordering=-consequence_of_failure
```

**Notes:**
- Prefix with `-` for descending order
- Only fields listed in `ordering_fields` above are accepted; anything else is silently ignored

### Combining Filters

**Request:**
```bash
GET /api/assets/?asset_type=Mechanical&status=Operational&ordering=-condition_rating
GET /api/conditions/?asset=1&inspection_date__gte=2025-01-01&ordering=-inspection_date
```

---

## Common Query Examples

### Get All Critical Risks

```bash
# First, get all risks (or use /api/reports/prioritisation/ for pre-computed bands)
curl http://localhost:8000/api/risks/

# Then filter client-side on combined_score >= 100 (the "Critical" band threshold)
```

### Get Assets Needing Maintenance

```bash
curl "http://localhost:8000/api/assets/?status=Maintenance"
```

### Get Recent Condition Inspections

```bash
curl "http://localhost:8000/api/conditions/?ordering=-inspection_date"
```

### Get Active Projects for Specific Asset

```bash
curl "http://localhost:8000/api/projects/?asset=1&status=Active"
```

### Get Scenarios for Asset with NPV Calculation

```bash
curl "http://localhost:8000/api/scenarios/?asset=1"

# Response includes npv, repair_npv, replacement_npv, lifecycle_cost, recommended_option
# and horizon_years for each scenario
```

---

## Rate Limiting

**Currently:** No rate limiting

Future versions may implement rate limiting.

---

## CORS

**Always-allowed dev origins** (hardcoded in `settings.py`, in addition to whatever
`CORS_ALLOWED_ORIGINS`/`CORS_ALLOWED_ORIGIN_REGEXES` env vars add for production):
- http://localhost:5173
- http://localhost:8080
- http://127.0.0.1:5173
- http://127.0.0.1:8080

Production origins are read from the environment, not hardcoded:
```bash
CORS_ALLOWED_ORIGINS=https://lcca-cppm.vercel.app,https://lcca-cppm-pj.vercel.app
CORS_ALLOWED_ORIGIN_REGEXES=...   # e.g. to allow every Vercel preview deployment
```

---

## Example API Workflow

### Complete Lifecycle Management Flow

```bash
# 1. Create an asset
curl -X POST http://localhost:8000/api/assets/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boiler A-12",
    "asset_type": "Mechanical",
    "location": "Building B",
    "installation_date": "2015-01-15",
    "condition_rating": 3.5,
    "remaining_useful_life": 5,
    "status": "Operational"
  }'
# Response: Asset ID = 1

# 2. Create a condition inspection
curl -X POST http://localhost:8000/api/conditions/ \
  -H "Content-Type: application/json" \
  -d '{
    "asset": 1,
    "inspection_date": "2025-04-22",
    "condition_score": 3.5,
    "notes": "Operational"
  }'

# 3. Create a risk assessment
curl -X POST http://localhost:8000/api/risks/ \
  -H "Content-Type: application/json" \
  -d '{
    "asset": 1,
    "probability_of_failure": 2.5,
    "consequence_of_failure": 4.0
  }'

# 4. Create scenario analyses
curl -X POST http://localhost:8000/api/scenarios/ \
  -H "Content-Type: application/json" \
  -d '{
    "asset": 1,
    "repair_cost": 5000,
    "replacement_cost": 25000,
    "maintenance_cost": 1000,
    "discount_rate": 5
  }'

# 5. Create capital project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Boiler Replacement",
    "asset": 1,
    "scope_description": "Full replacement of primary boiler unit.",
    "budget": 25000,
    "status": "Planning",
    "start_date": "2025-06-01",
    "end_date": "2025-12-01",
    "responsible_person": "Jane Doe"
  }'

# 6. Get reports list, or the pre-computed prioritisation view
curl http://localhost:8000/api/reports/
curl http://localhost:8000/api/reports/prioritisation/

# 7. Export report (fmt or format both work)
curl http://localhost:8000/api/reports/1/export/?fmt=pdf -o report.pdf
```

---

## Changelog

### Version 1.0 (Current)
- Initial API release
- 6 core resource endpoints
- Pagination support
- Search and filtering
- Report generation and export

---

**Last Updated:** July 2026 — corrected against current backend source (models/serializers/views),
not just endpoint shape. See notes inline for fields/routes that previously didn't match reality
(Conditions field names, Projects `spent`, Scenarios computed fields, Risks `criticality`/
`combined_score`, the 4th report + `/prioritisation/` route, and `page_size` not being supported).
