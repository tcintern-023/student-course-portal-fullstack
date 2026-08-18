# Student Course Portal

A multi-page Student Course Portal built with **Next.js (App Router)** and **Tailwind CSS**, demonstrating file-based routing, shared layouts, dynamic routes, and reusable components.

## Pages

| Route                     | Description                                  |
| -------------------------- | --------------------------------------------- |
| `/`                       | Home page with hero, stats, and featured courses |
| `/courses`                | Full list of courses                          |
| `/courses/[slug]`         | Dynamic course details page (e.g. `/courses/web-development`, `/courses/ai-engineering`) |
| `/instructors`            | List of instructors                           |
| `/contact`                | Contact form (static demo)                    |
| unknown routes            | Custom 404 page                               |

## Project Structure

```
app/
  layout.tsx            # Root layout — shared Navbar + Footer
  page.tsx               # Home page
  not-found.tsx           # Custom 404 page
  courses/
    page.tsx              # Courses listing
    [slug]/page.tsx        # Dynamic course details route
  instructors/
    page.tsx              # Instructors listing
  contact/
    page.tsx              # Contact form
components/
  Navbar.tsx              # Shared responsive navbar
  Footer.tsx              # Shared footer
  CourseCard.tsx           # Reusable course card
lib/
  data.ts                 # Static course & instructor data
```

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

Build for production:

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 16** — App Router, file-based routing, `generateStaticParams` for dynamic routes
- **React 19**
- **Tailwind CSS 4** — fully responsive, mobile-first design
- **TypeScript**

## Notes

- All course and instructor data lives in `lib/data.ts` — swap this out for a real API/backend later.
- The contact form is a static client-side demo (no backend wired up yet).
- Dynamic routes are pre-rendered at build time via `generateStaticParams`, and unknown course slugs fall through to the custom 404 page.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Student Course Portal - Next.js App Router project"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```


## Today's Task Implementation

- Course and instructor data are separated into `lib/courses.ts` and `lib/instructors.ts`.
- Courses and instructors are rendered dynamically from data files.
- Course search filters by title, category, instructor, level, description, and topics.
- Course details display related courses.
- Reusable components are used for course cards, search, buttons, titles, and related courses.
- Featured courses are displayed on the Home page.
- A loading skeleton is provided at `app/courses/loading.tsx`.
- Empty search results are handled with an empty state.
- Server Components are used for data-driven pages; `CourseSearch` is a Client Component for interactive search state.
