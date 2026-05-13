# Backend Setup & Architecture

Complete guide for setting up the Django backend for Asset Lifecycle Insight.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Permissions](#permissions)
- [Deployment](#deployment)

---

## Prerequisites

- **Python:** 3.9 or higher
- **pip:** Python package manager
- **Database:** SQLite (included with Python) for development

Check your Python version:
```bash
python --version
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Veenbreeze/LCCA-CPPM .git
cd LCCA-CPPM /backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Required Packages:**
- Django >= 6.0
- djangorestframework >= 3.14
- djangorestframework-simplejwt >= 2.0
- python-dotenv >= 1.0
- django-filter >= 23.0
- dj-database-url >= 1.0
- django-cors-headers >= 4.0
- psycopg2-binary >= 2.9 (for PostgreSQL)

### 4. Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Debug mode (set to False in production)
DEBUG=True

# Secret key (generate a random one for production)
SECRET_KEY=django-insecure-your-secret-key-here

# Allowed hosts
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database configuration
DATABASE_URL=sqlite:///db.sqlite3

# CORS settings (frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081

# JWT settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### 5. Run Migrations

```bash
python manage.py migrate
```

Expected output shows all migrations applied:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, assets, conditions, projects, risk, scenarios
Running migrations:
  Applying contenttypes.0001_initial... OK
  ...
```

### 6. Create Superuser (Admin Access)

```bash
python manage.py createsuperuser
```

Follow prompts to create admin credentials.

### 7. Run Development Server

```bash
python manage.py runserver
```

Server runs at `http://localhost:8000`

Access admin panel: `http://localhost:8000/admin`

---

## Configuration

### Django Settings

Located in `lifecycle_cost_analysis/settings.py`

**Key Settings:**
```python
# Authentication disabled for public API access
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny'
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS configuration for frontend communication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
]
```

### Database Configuration

**SQLite (Development):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**PostgreSQL (Production):**
```bash
# Install psycopg2
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/lcca_cppm
```

---

## Database Schema

### Asset Model
```python
class Asset:
    - id: int (PK)
    - name: str (unique)
    - asset_type: str (choices: Mechanical, Electrical, Structural, etc.)
    - location: str
    - installation_date: date
    - condition_rating: decimal (1-5)
    - remaining_useful_life: int (years)
    - status: str (choices: Operational, Maintenance, Retired)
```

**Example:**
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

### Condition Model
```python
class Condition:
    - id: int (PK)
    - asset: int (FK to Asset)
    - assessment_date: date
    - rating: decimal (1-5)
    - notes: str (optional)
    - inspector: str (optional)
```

### Risk Model
```python
class Risk:
    - id: int (PK)
    - asset: int (OneToOneField to Asset)
    - probability_of_failure: decimal (1-5)
    - consequence_of_failure: decimal (1-5)
    - computed_risk_score: decimal (calculated: PoF × CoF)
```

**Example:**
```json
{
  "id": 1,
  "asset": 1,
  "probability_of_failure": "2.5",
  "consequence_of_failure": "4.0",
  "computed_risk_score": "10.0"
}
```

### Project Model
```python
class Project:
    - id: int (PK)
    - name: str (unique)
    - status: str (choices: Planning, Active, Completed)
    - budget: decimal
    - spent: decimal
    - start_date: date
    - end_date: date (nullable)
    - asset: int (FK to Asset)
```

### Scenario Model
```python
class Scenario:
    - id: int (PK)
    - asset: int (FK to Asset)
    - repair_cost: decimal
    - replacement_cost: decimal
    - maintenance_cost: decimal
    - discount_rate: decimal (%)
    - computed_npv: decimal (calculated)
```

---

## API Overview

### Base URL
```
http://localhost:8000/api/
```

### Core Resources

#### 1. Assets Endpoint
```
GET    /api/assets/              # List all assets
POST   /api/assets/              # Create new asset
GET    /api/assets/{id}/         # Get specific asset
PUT    /api/assets/{id}/         # Update asset
DELETE /api/assets/{id}/         # Delete asset
```

**Filters & Search:**
```bash
# Search by name or location
GET /api/assets/?search=boiler

# Filter by type
GET /api/assets/?asset_type=Mechanical

# Filter by status
GET /api/assets/?status=Operational

# Ordering
GET /api/assets/?ordering=-condition_rating
```

**Example Response:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Boiler A-12",
      "asset_type": "Mechanical",
      "location": "Building B",
      "installation_date": "2015-01-15",
      "condition_rating": "3.5",
      "remaining_useful_life": 5,
      "status": "Operational"
    }
  ]
}
```

#### 2. Conditions Endpoint
```
GET    /api/conditions/          # List all conditions
POST   /api/conditions/          # Create condition record
GET    /api/conditions/{id}/     # Get specific condition
PUT    /api/conditions/{id}/     # Update condition
DELETE /api/conditions/{id}/     # Delete condition
```

**Filters:**
```bash
GET /api/conditions/?asset={asset_id}
GET /api/conditions/?assessment_date__gte=2025-01-01
```

#### 3. Risks Endpoint
```
GET    /api/risks/               # List all risks
POST   /api/risks/               # Create risk assessment
GET    /api/risks/{id}/          # Get specific risk
PUT    /api/risks/{id}/          # Update risk
DELETE /api/risks/{id}/          # Delete risk
```

**Filters:**
```bash
GET /api/risks/?asset={asset_id}
```

**Example Request (POST):**
```json
{
  "asset": 1,
  "probability_of_failure": 2.5,
  "consequence_of_failure": 4.0
}
```

#### 4. Projects Endpoint
```
GET    /api/projects/            # List all projects
POST   /api/projects/            # Create project
GET    /api/projects/{id}/       # Get specific project
PUT    /api/projects/{id}/       # Update project
DELETE /api/projects/{id}/       # Delete project
```

**Filters:**
```bash
GET /api/projects/?status=Active
GET /api/projects/?asset={asset_id}
```

#### 5. Scenarios Endpoint
```
GET    /api/scenarios/           # List all scenarios
POST   /api/scenarios/           # Create scenario
GET    /api/scenarios/{id}/      # Get specific scenario
PUT    /api/scenarios/{id}/      # Update scenario
DELETE /api/scenarios/{id}/      # Delete scenario
```

**Example Request (POST):**
```json
{
  "asset": 1,
  "repair_cost": 5000,
  "replacement_cost": 25000,
  "maintenance_cost": 1000,
  "discount_rate": 5
}
```

#### 6. Reports Endpoint
```
GET    /api/reports/             # List available reports
GET    /api/reports/{id}/        # Get report details
GET    /api/reports/{id}/export/ # Export report (PDF/CSV)
```

**Export Parameters:**
```bash
GET /api/reports/1/export/?format=pdf
GET /api/reports/1/export/?format=csv
```

---

## Authentication

Currently disabled for public API access. All endpoints use `AllowAny` permission.

### Enabling JWT Authentication (Optional)

To enable JWT authentication:

1. Update `settings.py`:
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

2. Get token:
```bash
POST /api/token/
{
  "username": "admin",
  "password": "password"
}

# Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

3. Use token in requests:
```bash
Authorization: Bearer {access_token}
```

---

## Permissions

### Current Configuration
All endpoints use `AllowAny` permission for public access.

### Available Permission Classes
- `AllowAny` - No authentication required
- `IsAuthenticated` - JWT token required
- `IsAdminUser` - Admin access only
- `RoleBasedPermission` - Custom role-based access

---

## Management Commands

### Create Sample Data

```bash
python manage.py shell
```

Then run:
```python
from assets.models import Asset
from risk.models import Risk

# Create assets
asset1 = Asset.objects.create(
    name="Boiler A-12",
    asset_type="Mechanical",
    location="Building B",
    installation_date="2015-01-15",
    condition_rating=3.5,
    remaining_useful_life=5,
    status="Operational"
)

# Create risk assessment
risk1 = Risk.objects.create(
    asset=asset1,
    probability_of_failure=2.5,
    consequence_of_failure=4.0
)

print(f"Asset {asset1.id} created with risk score {risk1.computed_risk_score}")
```

### Export Database

```bash
python manage.py dumpdata > backup.json
```

### Import Database

```bash
python manage.py loaddata backup.json
```

---

## Deployment

### Production Checklist

1. **Set DEBUG = False**
   ```env
   DEBUG=False
   ```

2. **Generate New Secret Key**
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

3. **Configure Production Database**
   ```env
   DATABASE_URL=postgresql://user:password@prod-host:5432/lcca
   ```

4. **Use Production Server**
   ```bash
   pip install gunicorn
   gunicorn lifecycle_cost_analysis.wsgi:application --bind 0.0.0.0:8000
   ```

5. **Configure HTTPS**
   - Set `SECURE_SSL_REDIRECT = True`
   - Set `SESSION_COOKIE_SECURE = True`
   - Set `CSRF_COOKIE_SECURE = True`

6. **Static Files**
   ```bash
   python manage.py collectstatic --noinput
   ```

7. **Database Backups**
   ```bash
   # Regular backups
   pg_dump lcca_cppm > backup_$(date +%Y%m%d).sql
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "lifecycle_cost_analysis.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Build and run:
```bash
docker build -t lcca-backend .
docker run -p 8000:8000 lcca-backend
```

---

## Troubleshooting

### Issue: Port 8000 Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process (Unix/Linux)
kill -9 <PID>

# Use different port
python manage.py runserver 8001
```

### Issue: Database Locked (SQLite)
```bash
# Delete database file
rm db.sqlite3

# Recreate database
python manage.py migrate
```

### Issue: Migration Errors
```bash
# Reset migrations (development only)
python manage.py migrate --zero <app_name>

# Recreate migrations
rm <app_name>/migrations/0*.py
python manage.py makemigrations
python manage.py migrate
```

---

**Last Updated:** May 2026
