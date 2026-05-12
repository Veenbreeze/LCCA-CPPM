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

All endpoints are publicly accessible. No API key or token required.

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
      "status": "Operational"
    },
    {
      "id": 2,
      "name": "Electrical Panel 02",
      "asset_type": "Electrical",
      "location": "Building A, Basement",
      "installation_date": "2010-06-20",
      "condition_rating": "2.5",
      "remaining_useful_life": 3,
      "status": "Maintenance"
    }
  ]
}
```

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
  "status": "Operational"
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
  "status": "Operational"
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
  "status": "Operational"
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
  "status": "Maintenance"
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

Track asset condition assessments over time.

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
      "assessment_date": "2025-04-22",
      "rating": "3.5",
      "notes": "Normal wear and tear observed",
      "inspector": "John Smith"
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
  "assessment_date": "2025-04-22",
  "rating": 3.5,
  "notes": "Normal wear and tear observed",
  "inspector": "John Smith"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "asset": 1,
  "assessment_date": "2025-04-22",
  "rating": "3.5",
  "notes": "Normal wear and tear observed",
  "inspector": "John Smith"
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
  "rating": 3.0,
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

Manage risk assessments using Probability × Consequence matrix.

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
      "computed_risk_score": "10.0"
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
  "computed_risk_score": "10.0"
}
```

**Notes:**
- `probability_of_failure`: 1-5 scale
- `consequence_of_failure`: 1-5 scale
- `computed_risk_score`: Calculated as PoF × CoF

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

Manage capital projects and track budget/status.

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
      "status": "Active",
      "budget": "50000.00",
      "spent": "35000.00",
      "start_date": "2025-01-15",
      "end_date": null,
      "asset": 1
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
  "status": "Planning",
  "budget": 75000,
  "spent": 0,
  "start_date": "2025-06-01",
  "end_date": null,
  "asset": 3
}
```

**Response:** (201 Created)
```json
{
  "id": 2,
  "name": "HVAC System Replacement",
  "status": "Planning",
  "budget": "75000.00",
  "spent": "0.00",
  "start_date": "2025-06-01",
  "end_date": null,
  "asset": 3
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
  "spent": 75000.00,
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

Analyze lifecycle cost scenarios (repair vs replacement vs maintenance).

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
      "computed_npv": "23000.00"
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
  "computed_npv": "23000.00"
}
```

**Notes:**
- NPV calculation: `(repair_cost + maintenance_cost) - replacement_cost`
- Adjusted by discount rate
- Lower NPV indicates better scenario

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

Generate and export reports.

### List Reports

**Request:**
```http
GET /api/reports/
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Asset Lifecycle Report",
    "description": "Full inventory with condition, RUL, and replacement timing.",
    "updated": "2025-04-22"
  },
  {
    "id": 2,
    "title": "CAPEX Analysis",
    "description": "Budget vs spend across all capital projects, ROI, variance.",
    "updated": "2025-04-20"
  },
  {
    "id": 3,
    "title": "Risk Prioritization",
    "description": "Ranked risk register with PoF/CoF scoring & mitigation status.",
    "updated": "2025-04-18"
  }
]
```

### Get Report Details

**Request:**
```http
GET /api/reports/{id}/
```

**Response:**
```json
{
  "id": 1,
  "title": "Asset Lifecycle Report",
  "description": "Full inventory with condition, RUL, and replacement timing.",
  "updated": "2025-04-22"
}
```

### Export Report

**Request:**
```http
GET /api/reports/{id}/export/?format={format}
```

**Parameters:**
- `format`: `pdf` (default) or `csv`

**Examples:**

**PDF Export:**
```bash
curl -X GET "http://localhost:8000/api/reports/1/export/?format=pdf" \
  -H "Accept: application/pdf" \
  -o report.pdf
```

**CSV Export:**
```bash
curl -X GET "http://localhost:8000/api/reports/1/export/?format=csv" \
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
| `page_size` | integer | 100 | 1000 |

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

### Search (Full-Text)

**Request:**
```bash
GET /api/assets/?search=boiler
GET /api/conditions/?search=John%20Smith
```

### Field Filtering

**Request:**
```bash
GET /api/assets/?asset_type=Mechanical
GET /api/assets/?status=Operational
GET /api/projects/?status=Active
GET /api/risks/?asset=1
```

### Date Filtering

**Request:**
```bash
GET /api/conditions/?assessment_date=2025-04-22
GET /api/conditions/?assessment_date__gte=2025-01-01
GET /api/conditions/?assessment_date__lte=2025-12-31
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
GET /api/risks/?ordering=-computed_risk_score
```

**Notes:**
- Prefix with `-` for descending order
- Available fields depend on the resource

### Combining Filters

**Request:**
```bash
GET /api/assets/?asset_type=Mechanical&status=Operational&ordering=-condition_rating
GET /api/conditions/?asset=1&assessment_date__gte=2025-01-01&ordering=-assessment_date
```

---

## Common Query Examples

### Get All Critical Risks

```bash
# First, get all risks
curl http://localhost:8000/api/risks/

# Then filter in frontend based on computed_risk_score >= 100
# Or implement custom endpoint
```

### Get Assets Needing Maintenance

```bash
curl "http://localhost:8000/api/assets/?status=Maintenance"
```

### Get Recent Condition Assessments

```bash
curl "http://localhost:8000/api/conditions/?ordering=-assessment_date&page_size=10"
```

### Get Active Projects for Specific Asset

```bash
curl "http://localhost:8000/api/projects/?asset=1&status=Active"
```

### Get Scenarios for Asset with NPV Calculation

```bash
curl "http://localhost:8000/api/scenarios/?asset=1"

# Response includes computed_npv for each scenario
```

---

## Rate Limiting

**Currently:** No rate limiting

Future versions may implement rate limiting.

---

## CORS

**Allowed Origins:**
- http://localhost:8080
- http://localhost:8081
- http://127.0.0.1:8080

Configure in backend `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
]
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

# 2. Create a condition assessment
curl -X POST http://localhost:8000/api/conditions/ \
  -H "Content-Type: application/json" \
  -d '{
    "asset": 1,
    "assessment_date": "2025-04-22",
    "rating": 3.5,
    "notes": "Operational",
    "inspector": "Tech A"
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
    "budget": 25000,
    "spent": 0,
    "status": "Planning",
    "start_date": "2025-06-01"
  }'

# 6. Get report
curl http://localhost:8000/api/reports/

# 7. Export report
curl http://localhost:8000/api/reports/1/export/?format=pdf -o report.pdf
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

**Last Updated:** May 2026
