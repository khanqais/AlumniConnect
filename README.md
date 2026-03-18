# AlumniConnect

AlumniConnect is a full-stack mentorship and career support platform that connects students with alumni for guidance, collaboration, referrals, webinars, resources, and community learning.

## Live Application

- Live Demo: https://alumniconnect-alpha.vercel.app

## Monorepo Structure

```text
AlumniConnect/
├── Frontend/           # React + TypeScript + Vite client
├── backend/            # Express + MongoDB API server
└── MLRecommendations/  # Flask ML/AI recommendation service
```

## Tech Stack

### Frontend (`Frontend/`)
- React 19 + TypeScript
- Vite + TailwindCSS
- Axios, React Router, Socket.IO client, Pusher client

### Backend (`backend/`)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO (real-time chat/video room signaling)
- Cloudinary + Multer (uploads)
- Nodemailer / email notifications

### ML Service (`MLRecommendations/`)
- Flask + Flask-CORS
- dotenv
- OpenAI-compatible client (Groq endpoint) for quiz generation support
- Recommendation endpoints for career-path and target-skills matching

## Core Features

- Authentication and role-based access (`student`, `alumni`, `admin`)
- Email verification
- Alumni and student profiles
- Resource repository with upload/download/interactions
- ATS resume checker
- Community Q&A and blogs
- Real-time messaging/chat
- Group creation and invite management
- Webinar scheduling, registration, attendance, and room validation
- Career and skill recommendation workflow via ML service
- Admin moderation/dashboard workflows

## System Architecture

1. `Frontend` calls backend API endpoints (`/api/...`) and protected routes using JWT.
2. `backend` handles business logic, data persistence (MongoDB), auth, and notifications.
3. `backend` calls `MLRecommendations` through `ML_SERVICE_URL` for recommendation data.
4. WebSocket connections are used for real-time interaction (non-serverless runtime).

## API Surface (Backend Mounts)

Backend routes are mounted under:

- `/api/auth`
- `/api/profile`
- `/api/admin`
- `/api/resources`
- `/api/blogs`
- `/api/questions`
- `/api/webinars`
- `/api/availability`
- `/api/recommend`
- `/api/messages`
- `/api/feed`
- `/api/referrals`
- `/api/notifications`
- `/api/announcements`
- `/api/groups`

Health check:

- `GET /health`

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- Python 3.10+
- MongoDB connection string

### 1) Install Dependencies

### Frontend

```bash
cd Frontend
npm install
```

### Backend

```bash
cd ../backend
npm install
```

### ML Service

```bash
cd ../MLRecommendations
pip install -r requirements.txt
```

### 2) Configure Environment Variables

Create a `.env` in `backend/` with at least:

```dotenv
MONGO_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://127.0.0.1:5001
```

Optional integrations used by the codebase:

- Cloudinary credentials (`CLOUDINARY_*`)
- Email credentials (`EMAIL_*`)
- Admin bootstrap credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)

Create a `.env` in `MLRecommendations/` with:

```dotenv
GROQ_API_KEY=your_groq_api_key
```

Create a `.env` in `Frontend/` (optional) if backend is not proxied:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3) Run All Services

Use three terminals:

### Terminal A — Backend

```bash
cd backend
npm run dev
```

### Terminal B — Frontend

```bash
cd Frontend
npm run dev
```

### Terminal C — ML Service

```bash
cd MLRecommendations
python ml_service.py
```

Then open:

- Local frontend: http://localhost:5173
- Local backend health: http://localhost:5000/health

## Production/Deployment Notes

- Frontend is configured for Vercel static hosting (`Frontend/vercel.json`).
- Backend and ML service include Vercel serverless rewrites (`backend/vercel.json`, `MLRecommendations/vercel.json`).
- Socket.IO and cron logic are conditionally disabled when `VERCEL` is set in backend runtime.

## Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm start
```

## Known Operational Notes

- Recommendation endpoints depend on ML service availability (`ML_SERVICE_URL`).
- ATS checker endpoint accepts resume upload and returns heuristic scoring.
- Some functionality (real-time sockets/cron) behaves differently in serverless environments.

## License

No license file is currently defined in the repository.
