# Student Course Portal — Full Stack (Next.js + Express + PostgreSQL)

A course catalog with a Next.js frontend, an Express REST API, and a real
PostgreSQL database hosted on [Neon](https://neon.tech). Data now persists —
nothing resets when the server restarts.

```
Next.js → Express API → PostgreSQL (Neon) → Express → Next.js → UI
```

## Project Structure

```
student-course-portal-final/   ← Next.js frontend
backend/                       ← Express API + PostgreSQL
  ├── db/schema.sql            ← table definitions
  ├── scripts/migrate.js       ← runs schema.sql against DATABASE_URL
  ├── scripts/seed.js          ← inserts starter instructors + courses
  ├── models/                  ← SQL queries (one file per table)
  ├── controllers/, routes/, middleware/
  └── postman_collection.json  ← importable into Postman
```

## Database Schema

Four tables, with real relationships:

| Table | Relationship |
|---|---|
| `instructors` | — |
| `courses` | `instructor_id` → `instructors.id` (many courses, one instructor; `ON DELETE SET NULL`) |
| `students` | `user_id` → `users.id` (nullable, unique — links a profile to the login that owns it; `ON DELETE SET NULL`) |
| `enrollments` (bonus) | `student_id` + `course_id`, many-to-many join table (`ON DELETE CASCADE`, unique per pair) |

Full definitions are in `backend/db/schema.sql`.

## 1. Create the Database on Neon

1. Go to [neon.tech](https://neon.tech) and sign up (free tier, no card needed).
2. **Create a project** — name it anything, e.g. `student-course-portal`.
3. On the project dashboard, find **Connection string** (usually shown right
   away, or under **Connect**). Copy it — it looks like:
   ```
   postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```

## 2. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and paste your Neon connection string:

```env
PORT=4000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=<a long random string — see .env.example for how to generate one>
```

## 3. Create the Tables and Seed Starter Data

```bash
npm run migrate   # creates instructors, courses, students, enrollments
npm run seed      # inserts the original 6 courses + their instructors
```

Both are safe to re-run — `migrate` uses `CREATE TABLE IF NOT EXISTS`.

## 4. Start the Backend

```bash
npm start
```

You should see: `Backend API running on http://localhost:4000`

## 5. Start the Frontend

Open a **second terminal**:

```bash
cd student-course-portal-final
npm install
cp .env.example .env.local   # already points at localhost:4000/api
npm run dev
```

Visit `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | List courses — supports `?search=`, `?category=`, `?level=`, `?page=`, `?limit=` |
| GET | `/api/courses/:id` | Get one course |
| POST | `/api/courses` | Create a course (`instructorId` optional) |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |
| GET | `/api/instructors` | List instructors (with course count + course titles) |
| POST | `/api/instructors` | Create an instructor |
| PUT / DELETE | `/api/instructors/:id` | Update / delete |
| GET | `/api/students` | List students |
| GET | `/api/students/me` | The student profile linked to *your* account (or `null`) — requires login |
| POST | `/api/students` | Create a student record — admin only |
| PUT | `/api/students/:id` | Update a student — admin, or the owner updating their own profile |
| DELETE | `/api/students/:id` | Delete a student — admin only |
| GET | `/api/enrollments` | List enrollments — `?studentId=` or `?courseId=` to filter |
| POST | `/api/enrollments` | Enroll a student in a course |
| DELETE | `/api/enrollments/:id` | Unenroll |

## Authentication

Registration, login, and protected routes are backed by JWTs — no sessions,
no cookies, just a `Bearer` token the frontend stores and attaches to every
request.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`) — always created as `student`; see below |
| POST | `/api/auth/login` | Log in, returns `{ user, token }` |
| GET | `/api/auth/me` | Returns the current user — requires a valid token |

**Two test accounts are created by `npm run seed`:**

| Role | Email | Password |
|---|---|---|
| admin | `admin@studenthub.com` | `admin123` |
| student | `student@studenthub.com` | `student123` (seeded with a linked student profile, already enrolled in Web Development, so you can see ownership rules in action right away) |

### Authentication vs. authorization

- **Authentication** (`middleware/auth.js` → `authenticate`) just answers
  "who is this?" — it verifies the JWT and attaches `req.user`. Missing,
  malformed, or expired tokens get a **401**.
- **Authorization** answers "are they allowed to do *this*?", and this API
  uses two different strategies depending on the resource:
  - **Role-based (RBAC)** for catalog data that nobody personally owns —
    courses and instructors. Only `admin` accounts can create/update/delete
    them (`authorize("admin")`). A logged-in `student` gets a **403**, not
    a 401 — they're a real, authenticated user, just not permitted to do
    that particular thing.
  - **Ownership-based** for a student's own data — their profile and their
    enrollments. `middleware/ownership.js` (`attachOwnStudent`) looks up
    the `students` row linked to the logged-in user (`students.user_id`)
    and controllers compare that against the resource being touched.
    Admins bypass the check; everyone else can only edit their own profile
    (`PUT /api/students/:id`) or manage their own enrollments
    (`POST`/`DELETE /api/enrollments`) — touching someone else's is a
    **403**.

Every public registration becomes a `student` account — the client can't
choose `role` anymore (it used to be able to, which would have let anyone
grant themselves `admin`; see the comment in `authController.js`).
Registering also auto-creates and links a `students` row in the same
transaction, which is what makes the profile/enrollment ownership checks
possible. Promote someone to `admin`, or link a pre-existing roster entry
to a login, directly in the database.

**Who can do what:**

| Action | Requires |
|---|---|
| Browse courses/instructors | Nobody — public |
| Create/update/delete a course or instructor | Logged in **as admin** (RBAC) |
| View the full student roster (`GET /students`) | Logged in **as admin** |
| View your own linked student profile (`GET /students/me`) | Logged in |
| Update a student profile | Admin, or the owner of that profile (ownership) |
| Add/**Delete** a student | Logged in **as admin** |
| View the full enrollment list / any student's enrollments | Logged in **as admin** |
| View **your own** enrollments | Logged in |
| Enroll/unenroll yourself in a course | Logged in — must be your own `studentId` (ownership) |
| Enroll/unenroll *any* student | Logged in **as admin** |

On the frontend this splits into two different pages entirely, not just
different buttons on one page:

- **`/students`** — admin only. Full roster: add/delete any student, edit
  anyone's profile, enroll/unenroll anyone in any course.
- **`/dashboard`** — logged-in students only. Their own profile (view/edit),
  their own enrolled courses (with a self-enroll picker and an
  "Email instructor" `mailto:` link per course), and unenroll.

Non-admins never even see the `/students` link in the nav, and hitting
`/students` directly shows a redirect message instead of the roster. The
`/instructors` page also has a direct "Email {name}" link on every card, so
contacting an instructor doesn't require going through the dashboard.

Change these test passwords (or delete the accounts) before sharing a real
deployment link.

## Testing With Postman

Import `backend/postman_collection.json` into Postman — it has every
endpoint above pre-built, including search/filter/pagination examples.
Update the `baseUrl` collection variable if your backend runs somewhere
other than `localhost:4000`.

**For protected endpoints:** run **Auth → Login** first, copy the `token`
from the response, then paste it into the collection's `token` variable
(top-right "..." menu → Edit → Variables). Every protected request already
sends `Authorization: Bearer {{token}}`.

## How Instructors Flow From the Course Form

The Add/Edit Course form has an instructor dropdown populated from
`GET /api/instructors`, plus a "+ Add a new instructor…" option. Picking
that reveals name/email fields; submitting the form creates the instructor
first (`POST /api/instructors`), then creates the course linked to that new
`instructor_id` — so the instructor shows up on `/instructors` immediately,
with the course already listed under them.

## Frontend Pages

| Page | What it does |
|---|---|
| `/login` | Log in with email/password |
| `/signup` | Register a new account (defaults to `student` role) |
| `/courses` | Search, filter, paginate courses — Add/Edit/Delete are all admin-only |
| `/instructors` | List instructors with their course count, courses, and a direct "Email" link |
| `/students` | **Admin only.** Add/delete any student, edit any profile, enroll/unenroll anyone |
| `/dashboard` | **Logged-in students only.** Your own profile, self-enroll, unenroll, email your instructors |

`/students` is where the `enrollments` table becomes visible: enrolling a
student calls `POST /api/enrollments`, unenrolling calls
`DELETE /api/enrollments/:id`, and each student's card only offers courses
they aren't already enrolled in.

## Deployment

### Backend → Render (or Railway)

1. New Web Service → connect your GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm run migrate && npm run seed && npm start`
   (runs migration/seed once on each deploy — safe to re-run; drop
   `&& npm run seed` after the first successful deploy if you don't want the
   starter data reinserted)
5. Environment variables: `CLIENT_URL` (your Vercel domain), `DATABASE_URL`
   (your Neon connection string), `JWT_SECRET` (a long random string —
   generate one locally with the command in `.env.example` and use the
   same value everywhere so tokens issued by one deploy stay valid).

### Frontend → Vercel

Already deployed — just make sure `NEXT_PUBLIC_API_URL` points at your
Render backend's `/api` path, e.g. `https://your-backend.onrender.com/api`.

## Status Codes Used

- `200 OK` / `201 Created` — success
- `400 Bad Request` — invalid input, or a Postgres constraint violation
  (duplicate email, bad foreign key, etc.) mapped to a readable message
- `401 Unauthorized` — no token, or the token is missing/invalid/expired
  ("you haven't proven who you are")
- `403 Forbidden` — authenticated, but not allowed to do this (wrong role,
  or not the owner of the resource — "I know who you are, and it's a no")
- `404 Not Found` — record or route not found
- `500 Internal Server Error` — unexpected error

## Notes

- SSL is enabled automatically for any `DATABASE_URL` that isn't `localhost`
  (see `backend/config/db.js`) — required by Neon.
- Local testing was done against a real local PostgreSQL instance (not
  mocked) before wiring this up, so the same code path is verified end to
  end — swapping in the Neon connection string is the only change needed.
