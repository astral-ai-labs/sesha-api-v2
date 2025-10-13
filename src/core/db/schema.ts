/* ==========================================================================*/
/* schema.ts — Migration-friendly modernized schema (Drizzle ORM + PostgreSQL) */
/* Key improvements while maintaining compatibility:                          */
/*   - Normalized source data into separate table                            */
/*   - Organization-only ownership for presets and articles                  */
/*   - Better indexing strategy                                              */
/*   - Preserved critical fields for easy migration                          */
/*   - Enhanced progress tracking with 10% increments                        */
/* ==========================================================================*/

import { pgTable, pgEnum, uuid, varchar, text, boolean, timestamp, integer, index, uniqueIndex, serial, numeric, smallint, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

/* ==========================================================================*/
/* Enums                                                                      */
/* ==========================================================================*/

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);

// Enhanced status with 10% increments for better progress tracking
export const articleStatusEnum = pgEnum("article_status", ["pending", "started", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "failed", "completed", "archived"]);

// Headline authorship tracking
export const headlineAuthorEnum = pgEnum("headline_author", ["human", "ai"]);

export const blobsEnum = pgEnum("blobs", ["1", "2", "3", "4", "5", "6"]);
export const lengthEnum = pgEnum("length", ["100-250", "400-550", "700-850", "1000-1200"]);
export const modelEnum = pgEnum("model", ["claude-3.7", "claude-4", "claude-4.5"]);
export const ingestionTypeEnum = pgEnum("ingestion_type", ["digest", "aggregate"]);

/* ==========================================================================*/
/* Core Tables                                                                */
/* ==========================================================================*/

export const organizations = pgTable(
  "organizations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("organizations_name_idx").on(table.name)]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    isVerified: boolean("is_verified").default(false).notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("member").notNull(),
    orgId: integer("org_id")
      .references(() => organizations.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_org_id_idx").on(table.orgId),
    uniqueIndex("users_one_admin_per_org_idx")
      .on(table.orgId)
      .where(sql`${table.role} = 'admin'`),
  ]
);

export const presets = pgTable(
  "presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    instructions: text("instructions").notNull(),

    orgId: integer("org_id")
      .references(() => organizations.id)
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("presets_org_id_idx").on(table.orgId)]
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    slug: varchar("slug", { length: 255 }).notNull(),
    version: numeric("version", { precision: 4, scale: 2 }).default("1.00").notNull(),

    orgId: integer("org_id")
      .references(() => organizations.id)
      .notNull(),

    headline: varchar("headline", { length: 500 }),
    blob: text("blob"),
    content: text("content"),
    richContent: text("rich_content"),

    inputInstructions: text("input_instructions"),
    inputBlobs: blobsEnum("input_blobs").notNull(),
    inputLength: lengthEnum("input_length").notNull(),
    inputModel: modelEnum("input_model").default("claude-3.7").notNull(),

    status: articleStatusEnum("status").default("pending").notNull(),
    ingestionType: ingestionTypeEnum("ingestion_type").default("digest").notNull(),

    // Headline authorship tracking
    headlineAuthor: headlineAuthorEnum("headline_author").default("ai").notNull(),

    // Rips
    ripScore: integer("rip_score").default(0), // 0-100 score
    ripAnalysis: text("rip_analysis").default(""), // Overall analysis text
    ripComparisons: jsonb("rip_comparisons").default([]), // JSON string of QuoteComparison[]

    // The user who originally created the article (triggered the AI run)
    createdByUserId: uuid("created_by_user_id").references(() => users.id),

    // The user who last changed the article (human edits)
    changedByUserId: uuid("changed_by_user_id").references(() => users.id),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

    // Track when status was last updated for efficient polling
    statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("articles_org_slug_version_idx").on(table.orgId, table.slug, table.version), index("articles_org_slug_idx").on(table.orgId, table.slug), index("articles_status_idx").on(table.status), index("articles_status_updated_at_idx").on(table.statusUpdatedAt), index("articles_created_by_user_id_idx").on(table.createdByUserId), index("articles_changed_by_user_id_idx").on(table.changedByUserId)]
);

export const articleSources = pgTable(
  "article_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articleId: uuid("article_id")
      .references(() => articles.id, { onDelete: "cascade" })
      .notNull(),

    text: text("text").notNull(),
    url: text("url"),
    description: text("description"),
    attribution: text("attribution"),

    isVerbatim: boolean("is_verbatim").default(false).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    isBase: boolean("is_base").default(false).notNull(),

    sortOrder: smallint("sort_order").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("article_sources_article_id_idx").on(table.articleId), uniqueIndex("article_sources_article_sort_idx").on(table.articleId, table.sortOrder)]
);

export const runs = pgTable(
  "runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // The article that was run
    articleId: uuid("article_id")
      .references(() => articles.id)
      .notNull(),

    // The user that triggered the run
    triggeredByUserId: uuid("triggered_by_user_id").references(() => users.id),

    ingestionType: ingestionTypeEnum("ingestion_type").notNull(),
    length: lengthEnum("length").notNull(),

    // Token counts
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),

    // Cost in USD
    costUsd: numeric("cost_usd", { precision: 12, scale: 6 }).default("0.00").notNull(),

    runTime: timestamp("run_time", { withTimezone: true }).defaultNow().notNull(),

    // When it was created
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("runs_article_idx").on(table.articleId), index("runs_triggered_by_user_id_idx").on(table.triggeredByUserId), index("runs_run_time_idx").on(table.runTime)]
);

/* ==========================================================================*/
/* Relations for the modernized schema                                       */
/* ==========================================================================*/

export const organizationRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  // All presets and articles are now org-owned
  orgPresets: many(presets, { relationName: "orgOwnedPresets" }),
  orgArticles: many(articles, { relationName: "orgOwnedArticles" }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),

  // Articles this user created (triggered AI runs for)
  createdArticles: many(articles, { relationName: "createdByUser" }),

  // Articles this user has edited
  changedArticles: many(articles, { relationName: "changedByUser" }),

  // Runs triggered by this user
  triggeredRuns: many(runs, { relationName: "triggeredByUser" }),
}));

export const presetRelations = relations(presets, ({ one }) => ({
  // Org ownership relation
  organization: one(organizations, {
    fields: [presets.orgId],
    references: [organizations.id],
    relationName: "orgOwnedPresets",
  }),
}));

export const articleRelations = relations(articles, ({ one, many }) => ({
  // Org ownership relation
  organization: one(organizations, {
    fields: [articles.orgId],
    references: [organizations.id],
    relationName: "orgOwnedArticles",
  }),

  // Audit relation - who created this article
  createdBy: one(users, {
    fields: [articles.createdByUserId],
    references: [users.id],
    relationName: "createdByUser",
  }),

  // Audit relation - who last changed this article
  changedBy: one(users, {
    fields: [articles.changedByUserId],
    references: [users.id],
    relationName: "changedByUser",
  }),

  // Normalized sources
  sources: many(articleSources),

  // Runs for this article
  runs: many(runs),
}));

export const articleSourceRelations = relations(articleSources, ({ one }) => ({
  article: one(articles, {
    fields: [articleSources.articleId],
    references: [articles.id],
  }),
}));

export const runRelations = relations(runs, ({ one }) => ({
  article: one(articles, {
    fields: [runs.articleId],
    references: [articles.id],
  }),

  triggeredBy: one(users, {
    fields: [runs.triggeredByUserId],
    references: [users.id],
    relationName: "triggeredByUser",
  }),
}));
