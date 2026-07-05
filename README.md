#Lifecycle Cost Analysis and Capital Project Portfolio Management (LCCA-CPPM)

A comprehensive full-stack application for **Lifecycle Cost Analysis** and **Capital Project Portfolio Management**. This system helps organizations manage assets, analyze costs, assess risks, and optimize capital decisions across their portfolio.

## 📋 Project Overview

**Asset Lifecycle Insight** is built to:
- Track physical and digital assets across an organization's portfolio
- Analyze lifecycle costs (repair, replacement, maintenance scenarios)
- Assess and prioritize risks using Probability × Consequence matrices
- Manage capital projects with financial analysis
- Generate comprehensive reports and insights

**Tech Stack:**
- **Backend:** Django 6.0 + Django REST Framework + SQLite
- **Frontend:** React 19.2 + TypeScript + TanStack Router + Vite + Tailwind CSS + Shadcn/ui
- **Database:** SQLite (development)
- **APIs:** RESTful with no authentication required (AllowAny permissions)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 18+ or Bun (for frontend)
- Git

### Clone the Repository

```bash
git clone https://github.com/Veenbreeze/LCCA-CPPM .git
cd LCCA-CPPM 
```

### Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Start the server
python manage.py runserver
# Server will be available at http://localhost:8000
```

### Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install
# or with bun:
bun install

# Start development server
npm run dev
# or with bun:
bun run dev
# Frontend will be available at http://localhost:8080 (or next available port)
```

---

## 📁 Project Structure

```
asset-lifecycle-insight/
├── backend/                    # Django application
│   ├── assets/                # Asset management module
│   ├── conditions/            # Asset condition tracking
│   ├── projects/              # Capital project management
│   ├── risk/                  # Risk assessment module
│   ├── scenarios/             # Lifecycle cost scenarios
│   ├── lifecycle_cost_analysis/  # Main project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── db.sqlite3
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── routes/            # Page components
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service layer
│   │   ├── lib/               # Utilities
│   │   └── styles/            # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
└── README.md (this file)
```

---

## 🔌 API Endpoints

All API endpoints are available at `http://localhost:8000/api/`

### Core Endpoints

| Module | Endpoint | Methods | Description |
|--------|----------|---------|-------------|
| **Assets** | `/api/assets/` | GET, POST, PUT, DELETE | Manage asset inventory |
| **Conditions** | `/api/conditions/` | GET, POST, PUT, DELETE | Track asset condition |
| **Risks** | `/api/risks/` | GET, POST, PUT, DELETE | Assess and prioritize risks |
| **Projects** | `/api/projects/` | GET, POST, PUT, DELETE | Manage capital projects |
| **Scenarios** | `/api/scenarios/` | GET, POST, PUT, DELETE | Analyze lifecycle cost scenarios |
| **Reports** | `/api/reports/` | GET | Generate reports |
| **Reports Export** | `/api/reports/{id}/export/` | GET | Export reports (PDF/CSV) |

### Response Format

All endpoints return paginated JSON responses:

```json
{
  "results": [
    {
      "id": 1,
      "name": "Asset Name",
      "...": "other fields"
    }
  ]
}
```

Or for direct list responses:
```json
[
  {
    "id": 1,
    "name": "Asset Name",
    "...": "other fields"
  }
]
```

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📚 Documentation

- **[Backend Setup & Architecture](./BACKEND_SETUP.md)** - Detailed backend configuration, database schema, and API details
- **[Frontend Setup & Architecture](./FRONTEND_SETUP.md)** - Frontend development guide, components, and services
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with request/response examples
- **[Development Guide](./DEVELOPMENT.md)** - Development workflow and best practices
- **[Deployment Guide](./DEPLOYMENT.md)** - Vercel (frontend) + Render/Railway (backend) deployment walkthrough

---

## ✨ Features

### Asset Management
- ✅ Create, read, update, delete assets
- ✅ Track asset type, location, condition, and RUL (Remaining Useful Life)
- ✅ Condition rating visualization (1-5 scale with color coding)
- ✅ Search and filter assets

### Risk Assessment
- ✅ Create risk assessments for assets
- ✅ Probability of Failure (PoF) and Consequence of Failure (CoF) scoring
- ✅ Automatic risk score calculation
- ✅ Risk heatmap visualization (5x5 matrix)
- ✅ Risk ranking and prioritization
- ✅ Level classification (Critical, High, Medium, Low)

### Scenario Analysis
- ✅ Create repair, replacement, and maintenance cost scenarios
- ✅ Calculate Net Present Value (NPV)
- ✅ Discount rate analysis
- ✅ Best scenario identification
- ✅ Cost comparison visualizations

### Project Management
- ✅ Create capital projects
- ✅ Link projects to assets
- ✅ Track budget and status
- ✅ Project filtering and search

### Reporting
- ✅ Asset lifecycle reports
- ✅ CAPEX analysis reports
- ✅ Risk prioritization reports
- ✅ Export to PDF and CSV formats

---

## 🔧 Configuration

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081
```

### Frontend Environment Variables

Environment variables are not required for development but can be set in `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📊 Sample Data

To populate the database with sample data:

```bash
cd backend
python manage.py shell
```

Then run Python commands to create sample records (see BACKEND_SETUP.md for detailed examples).

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## 🚢 Deployment

### Backend Deployment
- Use Gunicorn/WSGI server
- Configure production database (PostgreSQL recommended)
- Set `DEBUG=False` in production
- Configure proper `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- Use environment variables for secrets

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to static hosting
- Configure API endpoint environment variable

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) and [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) for production details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions, please:
1. Check existing documentation
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Open an issue on GitHub
4. Contact the development team

---

## 🗂️ Key Technologies

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API toolkit
- **SQLite** - Development database
- **django-cors-headers** - CORS support
- **django-filter** - Advanced filtering

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - Routing
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons

---

**Last Updated:** May 2026
