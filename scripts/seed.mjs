import pg from "pg"

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const now = Date.now()
const days = (n) => new Date(now + n * 24 * 60 * 60 * 1000)
const hours = (n) => new Date(now + n * 60 * 60 * 1000)

const courses = [
  {
    title: "The Complete Python Bootcamp: From Zero to Hero",
    slug: "complete-python-bootcamp",
    description: "Learn Python like a professional.",
    description_enriched:
      "Master Python programming from the ground up. This course covers Python fundamentals, data structures, object-oriented programming, file handling, web scraping, and building real-world projects. Perfect for absolute beginners who want to break into software development, data science, or automation. By the end you'll be able to write clean, efficient Python code and tackle your own projects with confidence.",
    instructor: "Jose Portilla",
    category: "Development",
    difficulty: "Beginner",
    thumbnail_url: "/courses/python-bootcamp.png",
    rating: 4.7,
    total_students: 1850000,
    coupon_code: "FREEPYTHON2026",
    coupon_url: "https://www.udemy.com/course/complete-python-bootcamp/?couponCode=FREEPYTHON2026",
    expires_at: days(3),
  },
  {
    title: "Modern React & Next.js Masterclass 2026",
    slug: "modern-react-nextjs-masterclass",
    description: "Build production-grade apps with React and Next.js.",
    description_enriched:
      "Go beyond the basics and build full-stack, production-ready web applications with React and Next.js. You'll learn the App Router, server components, server actions, data fetching patterns, authentication, and deployment. Includes hands-on projects: a SaaS dashboard, an e-commerce store, and a real-time chat app. Ideal for developers who already know JavaScript and want to level up.",
    instructor: "Maximilian Schwarzmüller",
    category: "Development",
    difficulty: "Intermediate",
    thumbnail_url: "/courses/react-nextjs.png",
    rating: 4.8,
    total_students: 920000,
    coupon_code: "REACTFREE",
    coupon_url: "https://www.udemy.com/course/modern-react-nextjs/?couponCode=REACTFREE",
    expires_at: hours(20),
  },
  {
    title: "UI/UX Design Fundamentals with Figma",
    slug: "ui-ux-design-fundamentals-figma",
    description: "Design beautiful interfaces from scratch.",
    description_enriched:
      "Learn the principles of user interface and user experience design while mastering Figma, the industry-standard design tool. This course covers design thinking, wireframing, prototyping, design systems, typography, color theory, and accessibility. You'll complete a full mobile app design from research to high-fidelity prototype. No prior design experience required.",
    instructor: "Daniel Walter Scott",
    category: "Design",
    difficulty: "Beginner",
    thumbnail_url: "/courses/ui-ux-figma.png",
    rating: 4.6,
    total_students: 410000,
    coupon_code: "DESIGNFREE",
    coupon_url: "https://www.udemy.com/course/ui-ux-figma-fundamentals/?couponCode=DESIGNFREE",
    expires_at: days(5),
  },
  {
    title: "Digital Marketing 2026: SEO, Social Media & Ads",
    slug: "digital-marketing-2026-seo-social",
    description: "A complete digital marketing strategy course.",
    description_enriched:
      "Become a well-rounded digital marketer. This comprehensive course covers search engine optimization (SEO), content marketing, social media strategy, paid advertising on Google and Meta, email marketing, and analytics. You'll learn how to build and measure campaigns that actually convert. Great for entrepreneurs, freelancers, and anyone looking to start a career in marketing.",
    instructor: "Phil Ebiner",
    category: "Marketing",
    difficulty: "All Levels",
    thumbnail_url: "/courses/digital-marketing.png",
    rating: 4.5,
    total_students: 670000,
    coupon_code: "MARKETFREE",
    coupon_url: "https://www.udemy.com/course/digital-marketing-2026/?couponCode=MARKETFREE",
    expires_at: hours(8),
  },
  {
    title: "Excel for Business Analytics & Data Visualization",
    slug: "excel-business-analytics",
    description: "Turn raw data into business insights with Excel.",
    description_enriched:
      "Unlock the analytical power of Microsoft Excel. Learn formulas, pivot tables, Power Query, data modeling, dashboards, and visualization techniques used by analysts every day. Through real business case studies you'll learn to clean data, build interactive reports, and present insights that drive decisions. Suitable for beginners and intermediate users.",
    instructor: "Kyle Pew",
    category: "Business",
    difficulty: "Beginner",
    thumbnail_url: "/courses/excel-analytics.png",
    rating: 4.6,
    total_students: 530000,
    coupon_code: "EXCELFREE",
    coupon_url: "https://www.udemy.com/course/excel-business-analytics/?couponCode=EXCELFREE",
    expires_at: days(2),
  },
  {
    title: "Docker & Kubernetes: The Complete Hands-On Guide",
    slug: "docker-kubernetes-hands-on",
    description: "Containerize and orchestrate applications.",
    description_enriched:
      "Master containerization and orchestration from scratch. This hands-on course teaches Docker fundamentals, writing Dockerfiles, multi-container apps with Docker Compose, and deploying scalable workloads with Kubernetes. You'll cover networking, volumes, secrets, deployments, and CI/CD integration. Ideal for backend and DevOps engineers ready to take their skills to production.",
    instructor: "Stephen Grider",
    category: "IT & Software",
    difficulty: "Advanced",
    thumbnail_url: "/courses/docker-kubernetes.png",
    rating: 4.7,
    total_students: 280000,
    coupon_code: "DEVOPSFREE",
    coupon_url: "https://www.udemy.com/course/docker-kubernetes-guide/?couponCode=DEVOPSFREE",
    expires_at: hours(36),
  },
  {
    title: "Photography Masterclass: From DSLR to Pro",
    slug: "photography-masterclass-dslr-pro",
    description: "Take stunning photos with any camera.",
    description_enriched:
      "Learn photography the right way. This masterclass covers camera settings, exposure, composition, lighting, portrait and landscape techniques, and post-processing. Whether you shoot with a DSLR, mirrorless, or smartphone, you'll develop the eye and technical skills to capture professional-quality images. Includes practical assignments and feedback-driven learning.",
    instructor: "Phil Ebiner",
    category: "Photography",
    difficulty: "Beginner",
    thumbnail_url: "/courses/photography.png",
    rating: 4.5,
    total_students: 360000,
    coupon_code: "PHOTOFREE",
    coupon_url: "https://www.udemy.com/course/photography-masterclass-pro/?couponCode=PHOTOFREE",
    expires_at: days(6),
  },
  {
    title: "Machine Learning A-Z: Hands-On Python",
    slug: "machine-learning-a-z-python",
    description: "Learn ML algorithms with practical Python code.",
    description_enriched:
      "A complete introduction to machine learning using Python. Covers regression, classification, clustering, dimensionality reduction, and an introduction to deep learning. Each algorithm is explained intuitively and implemented with real datasets using scikit-learn and TensorFlow. Perfect for aspiring data scientists who want a practical, project-based path into ML.",
    instructor: "Kirill Eremenko",
    category: "Development",
    difficulty: "Intermediate",
    thumbnail_url: "/courses/machine-learning.png",
    rating: 4.5,
    total_students: 1100000,
    coupon_code: "MLFREE2026",
    coupon_url: "https://www.udemy.com/course/machinelearning-a-z/?couponCode=MLFREE2026",
    expires_at: hours(12),
  },
]

async function main() {
  console.log("[seed] Seeding courses...")
  for (const c of courses) {
    await pool.query(
      `INSERT INTO courses
        (title, slug, description, description_enriched, instructor, category, difficulty,
         thumbnail_url, rating, total_students, coupon_code, coupon_url, expires_at,
         is_active, source, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,'seed',now(),now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description_enriched = EXCLUDED.description_enriched,
         thumbnail_url = EXCLUDED.thumbnail_url,
         rating = EXCLUDED.rating,
         total_students = EXCLUDED.total_students,
         expires_at = EXCLUDED.expires_at,
         is_active = true,
         updated_at = now()`,
      [
        c.title,
        c.slug,
        c.description,
        c.description_enriched,
        c.instructor,
        c.category,
        c.difficulty,
        c.thumbnail_url,
        c.rating,
        c.total_students,
        c.coupon_code,
        c.coupon_url,
        c.expires_at,
      ],
    )
    console.log(`[seed] OK: ${c.title}`)
  }

  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('affiliate_id', $1)
     ON CONFLICT (key) DO NOTHING`,
    [process.env.UDEMY_AFFILIATE_ID || ""],
  )

  console.log("[seed] Done.")
  await pool.end()
}

main().catch((err) => {
  console.error("[seed] Error:", err)
  process.exit(1)
})
