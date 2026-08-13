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
| `students` | — |
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
| GET / POST | `/api/students` | List / create students |
| PUT / DELETE | `/api/students/:id` | Update / delete |
| GET | `/api/enrollments` | List enrollments — `?studentId=` or `?courseId=` to filter |
| POST | `/api/enrollments` | Enroll a student in a course |
| DELETE | `/api/enrollments/:id` | Unenroll |

## Testing With Postman

Import `backend/postman_collection.json` into Postman — it has every
endpoint above pre-built, including search/filter/pagination examples.
Update the `baseUrl` collection variable if your backend runs somewhere
other than `localhost:4000`.

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
| `/courses` | Search, filter, paginate, add/edit/delete courses |
| `/instructors` | List instructors with their course count and course titles |
| `/students` | Add/edit/delete students, and enroll/unenroll them in courses — each student card has its own enrollment list and an "Enroll in a course" dropdown |

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
   (your Neon connection string).

### Frontend → Vercel

Already deployed — just make sure `NEXT_PUBLIC_API_URL` points at your
Render backend's `/api` path, e.g. `https://your-backend.onrender.com/api`.

## Status Codes Used

- `200 OK` / `201 Created` — success
- `400 Bad Request` — invalid input, or a Postgres constraint violation
  (duplicate email, bad foreign key, etc.) mapped to a readable message
- `404 Not Found` — record or route not found
- `500 Internal Server Error` — unexpected error

## Notes

- SSL is enabled automatically for any `DATABASE_URL` that isn't `localhost`
  (see `backend/config/db.js`) — required by Neon.
- Local testing was done against a real local PostgreSQL instance (not
  mocked) before wiring this up, so the same code path is verified end to
  end — swapping in the Neon connection string is the only change needed.
