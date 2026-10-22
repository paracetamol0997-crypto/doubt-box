# Doubt Box — Academic Doubt Clearing Web Platform

> **Tagline:** Ask Freely. Learn Confidently.

**Doubt Box** is a full-stack, production-style collegiate web application engineered to bridge the classroom confidence gap. It provides students with a judgment-free, private digital environment to submit academic doubts directly to verified faculty members, while empowering professors with subject-targeted inboxes, real-time WebSocket notifications, and resolution audit trails.

---

## 1. Key Features

- **Strict Role-Based Portals**: Completely isolated portals for Students, Faculty, and Administrators with independent login URLs (`/student/login` and `/teacher/login`) and backend authorization guards.
- **Faculty Verification Workflow**: Public teacher registrations are held in a pending state until verified and approved by college administrators.
- **Real-Time WebSocket Notifications**: Instant push alerts delivered to logged-in professors via Django Channels whenever a student posts a question in their subject.
- **Persistent Notification Center**: Every notification is stored in the database with read/unread tracking, ensuring offline faculty see past alerts upon logging in.
- **Privacy & Confidentiality**: Students can only inspect their own questions. Peers cannot view each other's doubts, and professors only see student register numbers for their assigned courses.
- **Audit History & Status Lifecycle**: Doubts transition cleanly through `PENDING` &rarr; `IN_PROGRESS` &rarr; `ANSWERED` &rarr; `RESOLVED` with an immutable change-log.
- **Search & Multi-Filter Controls**: Filter by subject, urgency/priority, review status, and search keywords.

---

## 2. Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling & UI**: Tailwind CSS v4 + Lucide React
- **Backend Framework**: Python 3.12 + Django 6.1
- **API Engine**: Django REST Framework (Token & Session Authentication)
- **ASGI & WebSockets**: Daphne + Django Channels (InMemoryLayer for dev, Redis for production)
- **Database**: SQLite (Local development) / PostgreSQL (Production ready)
- **Test Suite**: Django Unit Tests & API Test Client

---

## 3. Project Structure

```text
pen2/
├── backend/
│   ├── config/                     # Django core configuration & ASGI/WSGI
│   │   ├── asgi.py                 # ProtocolTypeRouter & WebSocket router
│   │   ├── settings.py             # Channels, CORS, Auth, Database settings
│   │   ├── urls.py                 # Primary API and admin URL routing
│   │   └── wsgi.py
│   ├── accounts/                   # Custom User, StudentProfile, TeacherProfile
│   │   ├── management/commands/
│   │   │   └── setup_doubtbox.py   # Seeding script for subjects & accounts
│   │   ├── models.py
│   │   ├── permissions.py          # IsStudent, IsApprovedTeacher, IsAdminUser
│   │   ├── serializers.py
│   │   ├── tests.py                # Accounts & auth boundary test suite
│   │   ├── urls.py
│   │   └── views.py
│   ├── subjects/                   # Academic subjects & faculty assignments
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── doubts/                     # Doubts, answers, and status history
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py                # Doubts workflow & privacy test suite
│   │   ├── urls.py
│   │   └── views.py
│   ├── notifications/              # WebSockets, consumers, and persistence
│   │   ├── consumers.py            # AsyncJsonWebsocketConsumer
│   │   ├── middleware.py           # TokenAuthMiddleware for WebSockets
│   │   ├── models.py               # Notification model
│   │   ├── routing.py              # ws/notifications/ routing
│   │   ├── services.py             # Real-time broadcast service
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/             # Logo, Navbar, Footer, Modal, Badge, Dropdowns
│   │   ├── context/                # AuthContext, ToastContext
│   │   ├── features/
│   │   │   ├── student/            # StudentDashboard, SubmitDoubtModal, DetailModal
│   │   │   └── teacher/            # TeacherDashboard, AnswerModal, PendingScreen
│   │   ├── pages/                  # LandingPage, HowItWorks, Login/Register pages
│   │   ├── services/               # api.ts, websocket.ts
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── App.tsx                 # Client routing & authentication guard
│   │   ├── main.tsx
│   │   └── index.css               # Tailwind CSS v4 directives
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts              # Vite proxy configuration for /api and /ws
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup & Installation

### Step A: Backend Setup

1. **Activate Python Virtual Environment**:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   # Or directly invoke:
   .\venv\Scripts\python.exe manage.py <command>
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run Database Migrations**:
   ```bash
   python manage.py makemigrations accounts subjects doubts notifications
   python manage.py migrate
   ```

4. **Seed Demonstration Data & Academic Subjects**:
   ```bash
   python manage.py setup_doubtbox
   ```

5. **Start Daphne ASGI Server (Port 8000)**:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

---

### Step B: Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install npm dependencies**:
   ```bash
   npm.cmd install
   ```

3. **Start the Vite development server**:
   ```bash
   npm.cmd run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 5. Seeded Test Credentials

You can use the following accounts configured during `python manage.py setup_doubtbox`:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@doubtbox.edu` | `Admin@12345` | Full Django Admin Access |
| **Faculty (Approved)** | `alan.turing@doubtbox.edu` | `Faculty@12345` | Computer Science Professor (CS101, CS201) |
| **Faculty (Approved)** | `ada.lovelace@doubtbox.edu` | `Faculty@12345` | Mathematics Professor (MATH101, MATH202) |
| **Faculty (Pending)** | `pending.faculty@doubtbox.edu` | `Faculty@12345` | Physics Professor (Awaiting Approval) |
| **Student** | `alex.chen@doubtbox.edu` | `Student@12345` | Reg: `REG2026CS101`, 2nd Year CS |

---

## 6. How to Test Student-to-Teacher Real-Time Notifications

1. Open two separate browser windows (or an Incognito window):
   - **Window 1 (Teacher)**: Go to `http://localhost:5173/teacher/login`. Log in as `alan.turing@doubtbox.edu` (Password: `Faculty@12345`). Keep the dashboard open. Notice the green indicator: `WebSocket Connected`.
   - **Window 2 (Student)**: Go to `http://localhost:5173/student/login`. Log in as `alex.chen@doubtbox.edu` (Password: `Student@12345`).
2. In Window 2 (Student), click **"Ask a New Doubt"**:
   - Select Course: `CS201 - Data Structures and Algorithms`
   - Title: `How does heapify work in O(n) time?`
   - Description: `I noticed building a max heap takes linear time instead of n log n. Could you explain the mathematical summation?`
   - Priority: `HIGH`
   - Click **Submit Doubt**.
3. **Observe Window 1 (Teacher)**:
   - Without refreshing the page, an in-app toast notification pops up: `New Doubt in CS201`.
   - The Pending Review count increments immediately.
   - The new question appears at the top of the Incoming Doubts queue.
   - The notification bell updates with an unread badge count.
4. In Window 1 (Teacher), click **"Review & Answer"**:
   - Type an explanation: `Because the work done at each height h is h * (n / 2^(h+1)). When summed across all levels, this converges to a constant multiple of n.`
   - Click **Publish Answer**.
5. **Observe Window 2 (Student)**:
   - The student instantly receives a real-time toast alert: `Doubt answered: DBT-XXXX-XXXX by Prof. Dr. Alan Turing`.
   - Clicking on the doubt opens the complete explanation thread.

---

## 7. Running Automated Tests

Run the complete backend test suite covering authentication, duplicate prevention, permission boundaries, and notification persistence:

```bash
cd backend
..\venv\Scripts\python.exe manage.py test
```

Expected result:
```text
Ran 9 tests in ~21s
OK
```

Run frontend production build verification:
```bash
cd frontend
npm.cmd run build
```

---

## 8. Administrative Workflow

1. Open `http://127.0.0.1:8000/admin/` in your browser.
2. Sign in with:
   - Email: `admin@doubtbox.edu`
   - Password: `Admin@12345`
3. Under **Accounts &rarr; Teacher profiles**:
   - Filter by **Pending** approval.
   - Select pending faculty members and apply the action: **"Approve selected teacher registrations"**.
   - The teacher's dashboard will immediately unlock access to doubts.

---

## 9. Production Deployment Checklist

- **PostgreSQL**: Set `DATABASE_URL` in `.env` or configure `DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql'`.
- **Redis Channel Layer**: Set `REDIS_URL=redis://your-redis-host:6379/1` in `.env` to scale WebSockets across multiple ASGI worker processes.
- **ASGI Process Manager**: Run Daphne or Uvicorn managed by `systemd` or `supervisord`.
- **Static Assets**: Run `python manage.py collectstatic --noinput` and serve through Nginx.
- **HTTPS & Cookies**: In production, set `DEBUG=False`, `SESSION_COOKIE_SECURE=True`, and `CSRF_COOKIE_SECURE=True`.
