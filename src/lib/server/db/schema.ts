import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text, } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	discordId: text('discord_id').notNull().unique(),
	points: integer('points').notNull().default(0),
	username: text('username').notNull(),
	picture: text('picture'),
	admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
});

export const userRelations = relations(user, ({ many }) => ({
	bounties: many(bounty),
	bountySubmissions: many(bountySubmission)
}))

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const bounty = sqliteTable('bounty', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	creator: text('creator').notNull().references(() => user.id),
	title: text('title').notNull(),
	completionCriteria: text('completion_criteria').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
	deadline: integer('deadline', { mode: 'timestamp_ms' }).notNull(),
	reward: integer('reward').notNull(),
})

export const bountyRelations = relations(bounty, ({ one, many }) => ({
	creator: one(user, {
		fields: [bounty.creator],
		references: [user.id],
	}),
	submission: many(bountySubmission)
}))

export const bountySubmission = sqliteTable('bounty_submission', {
	hash: text('hash').notNull().primaryKey(),
	// this should be relative from the media folder, not an absolute path
	mediaLocation: text('media_location'),
	submitter: text('creator').notNull().references(() => user.id),
	submittedAt: integer('submitted_at', { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
	bountyId: integer('bounty_id').notNull().references(() => bounty.id),
	accepted: integer('accepted', { mode: "boolean" }).default(false)
})

export const bountySubmissionRelations = relations(bountySubmission, ({ one }) => ({
	creator: one(user, {
		fields: [bountySubmission.submitter],
		references: [user.id],
	}),
	bounty: one(bounty, {
		fields: [bountySubmission.bountyId],
		references: [bounty.id]
	})
}))



export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Bounty = typeof bounty.$inferSelect;

export type BountySubmission = typeof bountySubmission.$inferSelect;