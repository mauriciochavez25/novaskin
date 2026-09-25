import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  ...timestamps,
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  clinicName: text("clinic_name").notNull(),
  tagline: text("tagline").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  contactNumbersUpdatedAt: timestamp("contact_numbers_updated_at", { withTimezone: true }),
  email: text("email").notNull(),
  address: text("address").notNull(),
  hours: text("hours").notNull(),
  instagram: text("instagram").notNull(),
  facebook: text("facebook").notNull(),
  tiktok: text("tiktok").notNull(),
  heroImage: text("hero_image").notNull(),
  heroEyebrow: text("hero_eyebrow").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroDescription: text("hero_description").notNull(),
  aboutText: text("about_text").notNull(),
  ...timestamps,
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  duration: text("duration"),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  posterUrl: text("poster_url"),
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
});

export const specialists = pgTable("specialists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url").notNull(),
  instagram: text("instagram"),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  comment: text("comment").notNull(),
  rating: integer("rating").notNull(),
  photoUrl: text("photo_url"),
  source: text("source").notNull().default("manual"),
  externalId: text("external_id"),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  active: boolean("active").default(true).notNull(),
  visibilityOverride: boolean("visibility_override"),
  ...timestamps,
});

export const googleBusinessOauthStates = pgTable("google_business_oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  adminId: integer("admin_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const googleReviewSettings = pgTable("google_review_settings", {
  id: serial("id").primaryKey(),
  placeId: text("place_id"),
  placeName: text("place_name"),
  formattedAddress: text("formatted_address"),
  googleMapsUrl: text("google_maps_url"),
  businessProfileRefreshToken: text("business_profile_refresh_token"),
  businessAccountName: text("business_account_name"),
  businessLocationName: text("business_location_name"),
  businessLocationTitle: text("business_location_title"),
  minRating: integer("min_rating").default(4).notNull(),
  autoSyncEnabled: boolean("auto_sync_enabled").default(true).notNull(),
  autoSyncEveryMinutes: integer("auto_sync_every_minutes").default(60).notNull(),
  autoSyncThreshold: integer("auto_sync_threshold").default(5).notNull(),
  totalReviewCount: integer("total_review_count").default(0).notNull(),
  lastSyncError: text("last_sync_error"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  exampleDraftsSeededAt: timestamp("example_drafts_seeded_at", { withTimezone: true }),
  ...timestamps,
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  ...timestamps,
});