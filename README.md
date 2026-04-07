# MK Slam Collector

MK Slam Collector is a production-ready personal slam book for Kurumurthy M (MK). Classmates can sign up, write thoughtful slam entries, save drafts, submit final answers, review previous slams, and soft delete their own entries. MK can sign in as the superadmin and review every active or deleted slam from a dedicated admin panel.

## Stack

- Frontend: React 19 + Vite + Tailwind CSS 4
- Backend: Django 6 + Django REST Framework + Gunicorn + WhiteNoise
- Database: MongoDB via `django-mongodb-backend`
- Auth: JWT access token in memory + HttpOnly refresh cookie

## Project structure

```text
slamds/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── mongo_migrations/
│   ├── slams/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   └── slamformk/
│       ├── src/
│       ├── .env.example
│       └── package.json
├── render.yaml
└── README.md
```

## Features

- Signup with name, email, roll number, password, and confirm password
- Auto-login immediately after successful signup
- Login with email and password
- JWT-protected backend routes
- Secure session approach with access token in memory and refresh token in an HttpOnly cookie
- Wakeup endpoint at `/api/v1/wakeup/` triggered as soon as the site loads
- Draft and submitted slam states
- Soft delete for user slams
- Submitted slams can be reopened, edited, and submitted again as updates
- Admin search, filter, sort, and deleted-slam visibility
- Admin can set a fresh user password or generate a temporary one
- Mobile responsive premium UI

## Local setup

### 1. Start MongoDB

Use either:

- A local MongoDB server at `mongodb://127.0.0.1:27017/`
- Or a MongoDB Atlas connection string

### 2. Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs on `http://localhost:8000`.

### 3. Frontend setup

```powershell
cd frontend\slamformk
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

### Backend

See `backend/.env.example`.

Most important values:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

### Frontend

See `frontend/slamformk/.env.example`.

- `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## API documentation

### Health

- `GET /api/v1/wakeup/`
  Returns a lightweight wakeup payload used by the frontend on app load.

### Auth

- `POST /api/v1/auth/signup/`
  Request:

  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "roll_number": "22CS001",
    "password": "StrongPass123",
    "confirm_password": "StrongPass123"
  }
  ```

- `POST /api/v1/auth/login/`
  Request:

  ```json
  {
    "email": "student@example.com",
    "password": "StrongPass123"
  }
  ```

- `POST /api/v1/auth/refresh/`
  Restores an access token using the HttpOnly refresh cookie.

- `POST /api/v1/auth/logout/`
  Clears the refresh cookie.

- `GET /api/v1/auth/me/`
  Returns the authenticated user profile.

### User slams

- `GET /api/v1/slams/`
  Returns the current user's visible slams and summary counts.

- `POST /api/v1/slams/`
  Create a slam as either a draft or final submission.

  ```json
  {
    "what_do_you_think": "MK is calm, reliable, and easy to trust.",
    "suggestions_or_message": "Keep building and keep smiling.",
    "status": "draft"
  }
  ```

- `GET /api/v1/slams/{slamId}/`
  Fetch one of the current user's visible slams.

- `PATCH /api/v1/slams/{slamId}/`
  Update an existing slam, including a previously submitted slam.

- `DELETE /api/v1/slams/{slamId}/`
  Soft delete the slam.

### Admin

- `GET /api/v1/slams/admin/`
  Superadmin-only endpoint with query parameters `search`, `status=draft|submitted`, `deleted=true|false`, and `ordering=-updated_at|updated_at|-submitted_at|submitted_at|writer|-writer`.

## Security notes

- Passwords are hashed by Django's password hashing system.
- Protected routes use JWT access tokens.
- Refresh tokens are stored in secure HttpOnly cookies.
- Submitted slams can be updated by their owner.
- User deletions are soft deletes only.
- Admin review never permanently removes database records.

## Deployment

This repo is now prepared for this hosting split:

- Backend: Render web service
- Frontend: Vercel project

Deployment-ready behavior already included:

- Django serves static files with WhiteNoise
- Gunicorn is configured for Render startup
- Render runs `python manage.py migrate` before deploy
- Render hostnames are accepted automatically by Django when available
- Cross-site refresh-cookie settings are configured for Vercel frontend + Render backend
- Vercel SPA rewrites are configured in `frontend/slamformk/vercel.json`

### Render backend

Use [render.yaml](/C:/Users/maren/slamds/render.yaml).

Backend env vars to set in Render:

- backend `MONGO_URI`
- backend `FRONTEND_URL`
- backend `CORS_ALLOWED_ORIGINS`
- backend `CORS_ALLOWED_ORIGIN_REGEXES` if you want Vercel preview deployments
- backend `CSRF_TRUSTED_ORIGINS`

Recommended backend values for production:

- `DJANGO_DEBUG=False`
- `JWT_REFRESH_COOKIE_SECURE=True`
- `JWT_REFRESH_COOKIE_SAMESITE=None`
- `SESSION_COOKIE_SECURE=True`
- `CSRF_COOKIE_SECURE=True`
- `SECURE_SSL_REDIRECT=True`

Suggested Render values:

- `FRONTEND_URL=https://your-app.vercel.app`
- `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`
- `CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\.vercel\.app$`
- `CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app,https://*.vercel.app`

Deploy flow for Render:

1. Create the backend web service from `render.yaml`.
2. Set `MONGO_URI` and the frontend URL-related env vars.
3. Deploy once and note the backend URL, for example `https://mk-slam-collector-api.onrender.com`.
4. Open the Render shell and run `python manage.py createsuperuser`.

### Vercel frontend

Frontend deployment files:

- [vercel.json](/C:/Users/maren/slamds/frontend/slamformk/vercel.json)
- [package.json](/C:/Users/maren/slamds/frontend/slamformk/package.json)

Vercel setup:

1. Import the repo in Vercel.
2. Set the root directory to `frontend/slamformk`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api/v1`
6. Redeploy after saving the env var.

If you use a custom Vercel domain, update Render:

- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`

If you are deploying into an existing Mongo database that already has Django collections but an empty `django_migrations` collection, repair the migration recorder once with:

```powershell
python manage.py migrate --fake-initial
python manage.py migrate slams 0002 --fake
```

## Verification completed

The following checks were run successfully:

- `python manage.py check`
- `npm run lint`
- `npm run build`
