# Lifecycle Cost Analysis and Capital Project Portfolio Management System

A professional Django backend API built with Django REST Framework for lifecycle asset management, condition tracking, risk modeling, capital project planning, and scenario analysis.

## Architecture

- Django project: `lifecycle_cost_analysis`
- Apps:
  - `assets`
  - `conditions`
  - `risk`
  - `projects`
  - `scenarios`
  - `core`

## Features

- RESTful CRUD endpoints via `ModelViewSet`
- JWT authentication with `djangorestframework-simplejwt`
- Filtering, search, ordering, and pagination
- PostgreSQL-ready database configuration via `dj-database-url`
- Environment-based settings using `.env`
- Admin registration for all domain models
- Production-friendly logging setup

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/Scripts/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env` and update as needed.

4. Run migrations:

   ```bash
   python manage.py migrate
   ```

5. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:

   ```bash
   python manage.py runserver
   ```

## API Endpoints

- `POST /api/token/` - obtain JWT token
- `POST /api/token/refresh/` - refresh JWT token
- `GET /api/assets/`
- `GET /api/conditions/`
- `GET /api/risks/`
- `GET /api/projects/`
- `GET /api/scenarios/`

## Notes

- Authenticated access is required for all API endpoints.
- Write operations require a staff user by default.
- Replace `DATABASE_URL` in `.env` with a PostgreSQL URI for production.
