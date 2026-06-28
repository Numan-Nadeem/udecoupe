import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionEnriched: text("description_enriched"),
  instructor: text("instructor"),
  category: text("category"),
  difficulty: text("difficulty"),
  thumbnailUrl: text("thumbnail_url"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  totalStudents: integer("total_students"),
  couponCode: text("coupon_code"),
  couponUrl: text("coupon_url").notNull().unique(),
  affiliateUrl: text("affiliate_url"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  isFlagged: boolean("is_flagged").default(false),
  expiredReports: integer("expired_reports").default(0),
  source: text("source"),
  rssSourceName: text("rss_source_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  token: text("token"),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow(),
})

export const couponClicks = pgTable("coupon_clicks", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id"),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  category: text("category"),
})

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
})

export const coursesRelations = relations(courses, ({ many }) => ({
  clicks: many(couponClicks),
}))

export const couponClicksRelations = relations(couponClicks, ({ one }) => ({
  course: one(courses, {
    fields: [couponClicks.courseId],
    references: [courses.id],
  }),
}))
