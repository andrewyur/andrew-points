import { encodeBase32LowerCase } from '@oslojs/encoding';
import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

function createId(): string {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes)
}

export const user = sqliteTable('user', {
	id: text('id').primaryKey().$defaultFn(createId),
	discordId: text('discord_id').notNull().unique(),
	username: text('username').notNull(),
	picture: text('picture'),
	admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
});

export const userRelations = relations(user, ({ many }) => ({
	bounties: many(bounty),
	bountySubmissions: many(bountySubmission),
	ledgerEntries: many(ledgerEntry)
}))

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const bounty = sqliteTable('bounty', {
	id: text('id').primaryKey().$defaultFn(createId),
	creatorId: text('creator').notNull().references(() => user.id),
	title: text('title').notNull(),
	fulfillmentCriteria: text('fulfillment_criteria').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
	deadline: integer('deadline', { mode: 'timestamp_ms' }).notNull(),
	reward: integer('reward').notNull(),
	completed: integer('completed', { mode: "boolean" }).notNull().default(false),
	fulfilledBy: text('fulfilledBy').references((): AnySQLiteColumn => bountySubmission.id)
})

export const bountyRelations = relations(bounty, ({ one, many }) => ({
	creator: one(user, {
		fields: [bounty.creatorId],
		references: [user.id],
	}),
	submissions: many(bountySubmission)
}))

export const bountySubmission = sqliteTable('bounty_submission', {
	id: text('id').primaryKey().$defaultFn(createId),
	hash: text('hash').notNull(),
	// this should be relative from the media folder, not an absolute path
	mediaLocation: text('media_location'),
	submitterId: text('creator').notNull().references(() => user.id),
	submittedAt: integer('submitted_at', { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
	bountyId: text('bounty_id').notNull().references(() => bounty.id),
	state: text('state').notNull().default('pending'), // pending | rejected | accepted
	height: integer('height').notNull(),
	width: integer('width').notNull(),
	type: text('type').notNull()
})

export const bountySubmissionRelations = relations(bountySubmission, ({ one }) => ({
	creator: one(user, {
		fields: [bountySubmission.submitterId],
		references: [user.id],
	}),
	bounty: one(bounty, {
		fields: [bountySubmission.bountyId],
		references: [bounty.id]
	})
}))

export const ledgerEntry = sqliteTable('ledger_entry', {
	id: text('id').primaryKey().$defaultFn(createId),
	userId: text('user').notNull().references(() => user.id),
	amount: integer('amount').notNull(),
	bountyId: text('bounty_id').references(() => bounty.id),
	offerId: text('offer_id').references(() => offer.id),
	type: text('type').notNull(),
	message: text('message'),
	createdAt: integer('submitted_at', { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const ledgerEntryRelations = relations(ledgerEntry, ({ one }) => ({
	user: one(user, {
		fields: [ledgerEntry.userId],
		references: [user.id]
	}),
	bounty: one(bounty, {
		fields: [ledgerEntry.bountyId],
		references: [bounty.id]
	}),
	offer: one(offer, {
		fields: [ledgerEntry.offerId],
		references: [offer.id]
	})
}))

export const offer = sqliteTable('offer', {
	id: text('id').primaryKey().$defaultFn(createId),
	posterId: text('poster_id').notNull().references(() => user.id),
	cost: integer('cost').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	buyerId: text('buyer_id').references(() => user.id),
	purchasedAt: integer('purchased_at', { mode: "timestamp_ms" }),
	completeBy: integer('complete_by', { mode: "timestamp_ms" }),
	state: text('state').notNull().default("active"), // "active" | "pending" | "disputed" | "completed"
	visibleTo: text('visibleTo').references(() => user.id)
})

export const offerRelations = relations(offer, ({ one }) => ({
	poster: one(user, {
		fields: [offer.posterId],
		references: [user.id]
	}),
	buyer: one(user, {
		fields: [offer.buyerId],
		references: [user.id]
	}),
}))

export const earnSession = sqliteTable('earn_session', {
	id: text('id').primaryKey().$defaultFn(createId),
	userId: text('user_id').notNull().references(() => user.id).unique(),
	remaining: integer('remaining').notNull().default(10),
	payout: integer('payout').notNull(),
	type: text('type').notNull(),
	expiresAt: integer('expires_at', { mode: "timestamp_ms" }).$defaultFn(() => {
		const now = new Date();
		now.setHours(now.getHours() + 3)
		return now
	})
})

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Bounty = typeof bounty.$inferSelect;

export type BountySubmission = typeof bountySubmission.$inferSelect;

export type LedgerEntry = typeof ledgerEntry.$inferSelect;

export type Offer = typeof offer.$inferSelect;