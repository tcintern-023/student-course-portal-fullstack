require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const instructors = [
  { name: "Ayesha Khan", email: "ayesha.khan@studenthub.com", bio: "Frontend engineer and design-systems enthusiast." },
  { name: "Bilal Ahmed", email: "bilal.ahmed@studenthub.com", bio: "AI/ML engineer and cloud infrastructure specialist." },
  { name: "Sana Malik", email: "sana.malik@studenthub.com", bio: "Data scientist focused on practical, applied ML." },
  { name: "Hamza Tariq", email: "hamza.tariq@studenthub.com", bio: "Mobile engineer shipping React Native apps since 2018." },
];

// Plain-text here only for seeding convenience — hashed before insert below.
// Change these credentials (or delete the users afterward) before sharing
// a real deployment link.
const testUsers = [
  { name: "Admin User", email: "admin@studenthub.com", password: "admin123", role: "admin" },
  { name: "Test Student", email: "student@studenthub.com", password: "student123", role: "student" },
];

const courses = [
  {
    slug: "web-development",
    title: "Web Development",
    category: "Web",
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Learn to build modern, responsive websites from scratch using HTML, CSS, JavaScript, and React. By the end of this course you'll be comfortable shipping full-stack web apps with Next.js.",
    topics: ["HTML & CSS", "JavaScript", "React", "Next.js", "Tailwind CSS"],
    instructorEmail: "ayesha.khan@studenthub.com",
  },
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    category: "Artificial Intelligence",
    level: "Advanced",
    duration: "10 weeks",
    description:
      "Dive into the fundamentals of machine learning, neural networks, and large language models. Build and deploy real AI-powered applications using modern tooling.",
    topics: ["Python", "Machine Learning", "Neural Networks", "LLMs", "Deployment"],
    instructorEmail: "bilal.ahmed@studenthub.com",
  },
  {
    slug: "data-science",
    title: "Data Science",
    category: "Data",
    level: "Intermediate",
    duration: "9 weeks",
    description:
      "Master the data science workflow — from cleaning and exploring data to building predictive models and communicating insights with clear visualizations.",
    topics: ["Python", "Pandas", "Statistics", "Visualization", "ML Basics"],
    instructorEmail: "sana.malik@studenthub.com",
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    category: "Mobile",
    level: "Intermediate",
    duration: "8 weeks",
    description:
      "Design and build cross-platform mobile apps with React Native, covering navigation, state management, and publishing to app stores.",
    topics: ["React Native", "Navigation", "State Management", "APIs", "App Store Deployment"],
    instructorEmail: "hamza.tariq@studenthub.com",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    category: "Design",
    level: "Beginner",
    duration: "6 weeks",
    description:
      "Learn the principles of great product design — user research, wireframing, prototyping, and building beautiful, usable interfaces.",
    topics: ["Design Thinking", "Wireframing", "Figma", "Prototyping", "Usability Testing"],
    instructorEmail: "ayesha.khan@studenthub.com",
  },
  {
    slug: "cloud-computing",
    title: "Cloud Computing",
    category: "Cloud",
    level: "Advanced",
    duration: "7 weeks",
    description:
      "Get hands-on with cloud infrastructure, containers, and CI/CD pipelines. Learn to design scalable, reliable systems in the cloud.",
    topics: ["AWS Basics", "Docker", "Kubernetes", "CI/CD", "Scalability"],
    instructorEmail: "bilal.ahmed@studenthub.com",
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Seeding test users...");
    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, passwordHash, user.role]
      );
    }

    console.log("Seeding instructors...");
    const emailToId = {};
    for (const instructor of instructors) {
      const { rows } = await client.query(
        `INSERT INTO instructors (name, email, bio)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, email`,
        [instructor.name, instructor.email, instructor.bio]
      );
      emailToId[rows[0].email] = rows[0].id;
    }

    console.log("Seeding courses...");
    for (const course of courses) {
      await client.query(
        `INSERT INTO courses (slug, title, category, level, duration, description, topics, instructor_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO NOTHING`,
        [
          course.slug,
          course.title,
          course.category,
          course.level,
          course.duration,
          course.description,
          course.topics,
          emailToId[course.instructorEmail],
        ]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
