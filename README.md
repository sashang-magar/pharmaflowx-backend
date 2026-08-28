# pharmaflowx-backend


A full-stack pharmaceutical supply chain management system built with Django REST Framework and React.

## Live Demo
- **Frontend**: [https://pharmaflowx-backend.vercel.app](https://pharmaflowx-backend.vercel.app)
- **Backend API**: [https://pharmaflowx-backend.onrender.com/api/](https://pharmaflowx-backend.onrender.com/api/)

## Tech Stack
- **Backend**: Django 5, Django REST Framework, PostgreSQL, JWT Authentication
- **Frontend**: React + Vite, Axios, React Router
- **Algorithm**: Reorder Point calculation for inventory management

## Roles & Features

| Role | Dashboard | Key Actions |
|---|---|---|
| Manufacturer | `/manufacturer` | Create medicines, create batches |
| Lab | `/lab` | Test batches, submit reports with file upload |
| Regulator | `/regulator` | Approve or reject lab reports |
| Distributor | `/distributor` | Manage inventory, confirm + deliver orders |
| Pharmacy | `/pharmacy` | Browse stock, place orders, cancel, review |

## Key Features
- Role-based access control — 5 distinct user roles with separate dashboards
- Full batch lifecycle: production → lab testing → approval → distribution
- Reorder Point algorithm — auto-calculates stock thresholds from 30-day order history
- File upload support for lab reports (PDF)
- JWT authentication with token refresh and blacklist on logout
- Admin panel with inventory alerts and CSV export

## Setup — Backend

```bash
git clone <your-repo-url>
cd pharmaflowx

pipenv install
pipenv shell

cp .env.example .env
# fill in your DB credentials in .env

python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver
```

## Setup — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Demo Credentials
Password for all accounts: `demo1234`

| Username | Role |
|---|---|
| `nepal_pharma` | Manufacturer |
| `himalaya_meds` | Manufacturer |
| `kathmandu_lab` | Lab |
| `patan_lab` | Lab |
| `drug_regulator` | Regulator |
| `valley_dist` | Distributor |
| `pokhara_dist` | Distributor |
| `sunrise_pharmacy` | Pharmacy |
| `green_pharmacy` | Pharmacy |
| `city_pharmacy` | Pharmacy |

## API Documentation
Swagger UI: `http://localhost:8000/api/docs/`

## Project Structure

```
pharmaflowx/
├── accounts/       — User model, profiles, JWT auth
├── medicines/      — Medicine and Batch models
├── labs/           — Lab reports
├── approvals/      — Regulatory approvals
├── inventory/      — Distributor inventory + reorder algorithm
├── orders/         — Orders, order items, reviews
└── frontend/       — React + Vite application
```