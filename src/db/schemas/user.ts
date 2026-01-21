import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/db/schemaHelpers";
import { relations } from "drizzle-orm";

export const userRoles = ["ADMIN", "MODERATOR", "USER", "BANNED"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRolesEnum = pgEnum("user_role", userRoles);

export const userColumns = {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRolesEnum().default("USER").notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  bio: text("bio"),
  banned: boolean("banned").default(false).notNull(),
  secretCode: text("secret_code").unique(),
  secretCodeGeneratedAt: timestamp("secret_code_generated_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
};

export const user = pgTable("user", userColumns, (table) => ({
  roleIdx: index("user_role_idx").on(table.role),
  secretCodeIdx: index("idx_users_secret_code").on(table.secretCode),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
