import { relations } from "drizzle-orm/relations";
import { user, account, moderationLogs, alias, notifications, blockedUsers, session, reports, threads, posts, comments } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	moderationLogs: many(moderationLogs),
	aliases: many(alias),
	notifications: many(notifications),
	blockedUsers_blockerId: many(blockedUsers, {
		relationName: "blockedUsers_blockerId_user_id"
	}),
	blockedUsers_blockedId: many(blockedUsers, {
		relationName: "blockedUsers_blockedId_user_id"
	}),
	sessions: many(session),
	reports: many(reports),
	threads: many(threads),
}));

export const moderationLogsRelations = relations(moderationLogs, ({one}) => ({
	user: one(user, {
		fields: [moderationLogs.moderatorId],
		references: [user.id]
	}),
}));

export const aliasRelations = relations(alias, ({one, many}) => ({
	user: one(user, {
		fields: [alias.userId],
		references: [user.id]
	}),
	threads: many(threads),
	comments: many(comments),
	posts: many(posts),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id]
	}),
}));

export const blockedUsersRelations = relations(blockedUsers, ({one}) => ({
	user_blockerId: one(user, {
		fields: [blockedUsers.blockerId],
		references: [user.id],
		relationName: "blockedUsers_blockerId_user_id"
	}),
	user_blockedId: one(user, {
		fields: [blockedUsers.blockedId],
		references: [user.id],
		relationName: "blockedUsers_blockedId_user_id"
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	user: one(user, {
		fields: [reports.reporterId],
		references: [user.id]
	}),
}));

export const threadsRelations = relations(threads, ({one, many}) => ({
	user: one(user, {
		fields: [threads.moderatorId],
		references: [user.id]
	}),
	alias: one(alias, {
		fields: [threads.aliasId],
		references: [alias.id]
	}),
	posts: many(posts),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	alias: one(alias, {
		fields: [comments.aliasId],
		references: [alias.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	comments: many(comments),
	thread: one(threads, {
		fields: [posts.threadId],
		references: [threads.id]
	}),
	alias: one(alias, {
		fields: [posts.aliasId],
		references: [alias.id]
	}),
}));