import { pgTable, foreignKey, text, timestamp, uuid, unique, boolean, index, json, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const notificationType = pgEnum("notification_type", ['NEW_REPLY', 'REPORT_RECEIVED', 'MODERATION_ACTION'])
export const reportStatus = pgEnum("report_status", ['PENDING', 'RESOLVED', 'DISMISSED'])
export const reportTargetType = pgEnum("report_target_type", ['POST', 'COMMENT', 'USER'])
export const threadStatus = pgEnum("thread_status", ['pending', 'published', 'rejected'])
export const userRole = pgEnum("user_role", ['ADMIN', 'MODERATOR', 'USER', 'BANNED'])


export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const moderationLogs = pgTable("moderation_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	moderatorId: text("moderator_id").notNull(),
	action: text().notNull(),
	targetId: uuid("target_id"),
	reason: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "moderation_logs_moderator_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const alias = pgTable("alias", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	alias: text().notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	rotationEnabled: boolean("rotation_enabled").default(false).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "alias_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("alias_alias_unique").on(table.alias),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	targetType: notificationType().notNull(),
	payload: json().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notifications_user_created_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsLast().op("timestamptz_ops")),
	index("notifications_user_unread_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isRead.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notifications_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const blockedUsers = pgTable("blocked_users", {
	blockerId: text("blocker_id").notNull(),
	blockedId: text("blocked_id").notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.blockerId],
			foreignColumns: [user.id],
			name: "blocked_users_blocker_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockedId],
			foreignColumns: [user.id],
			name: "blocked_users_blocked_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	role: userRole().default('USER').notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	username: text(),
	displayUsername: text("display_username"),
	banned: boolean().default(false).notNull(),
	bio: text(),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
	secretCode: text("secret_code"),
	secretCodeGeneratedAt: timestamp("secret_code_generated_at", { mode: 'string' }),
}, (table) => [
	index("idx_users_secret_code").using("btree", table.secretCode.asc().nullsLast().op("text_ops")),
	index("user_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	unique("user_email_unique").on(table.email),
	unique("user_username_unique").on(table.username),
	unique("user_secret_code_unique").on(table.secretCode),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const resources = pgTable("resources", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar().notNull(),
	description: text(),
	url: varchar().notNull(),
	category: varchar().notNull(),
	isOfficial: boolean("is_official").default(false).notNull(),
});

export const reports = pgTable("reports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reporterId: text("reporter_id").notNull(),
	targetId: uuid("target_id").notNull(),
	targetType: reportTargetType().notNull(),
	reason: text().notNull(),
	details: varchar(),
	status: reportStatus().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [user.id],
			name: "reports_reporter_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const threads = pgTable("threads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	aliasId: uuid("alias_id").notNull(),
	title: varchar().notNull(),
	body: text().notNull(),
	slug: varchar().notNull(),
	category: varchar().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	status: threadStatus().default('pending').notNull(),
	isSensitive: boolean("is_sensitive").default(false).notNull(),
	moderatedAt: timestamp("moderated_at", { withTimezone: true, mode: 'string' }),
	moderatorId: text("moderator_id"),
	rejectionReason: text("rejection_reason"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("threads_category_created_idx").using("btree", table.category.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsLast().op("timestamptz_ops")),
	index("threads_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
	index("threads_moderator_idx").using("btree", table.moderatorId.asc().nullsLast().op("text_ops")),
	index("threads_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("threads_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "threads_moderator_id_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.aliasId],
			foreignColumns: [alias.id],
			name: "threads_alias_id_alias_id_fk"
		}).onDelete("cascade"),
	unique("threads_title_unique").on(table.title),
	unique("threads_slug_unique").on(table.slug),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	postId: uuid("post_id").notNull(),
	aliasId: uuid("alias_id").notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("comments_post_created_idx").using("btree", table.postId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "comments_post_id_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.aliasId],
			foreignColumns: [alias.id],
			name: "comments_alias_id_alias_id_fk"
		}).onDelete("cascade"),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	threadId: uuid("thread_id").notNull(),
	aliasId: uuid("alias_id").notNull(),
	isSensitive: boolean("is_sensitive").default(false).notNull(),
	contentWarnings: text("content_warnings").array(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("posts_thread_created_idx").using("btree", table.threadId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.id],
			name: "posts_thread_id_threads_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.aliasId],
			foreignColumns: [alias.id],
			name: "posts_alias_id_alias_id_fk"
		}).onDelete("cascade"),
]);
