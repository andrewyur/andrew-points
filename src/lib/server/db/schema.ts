import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	discordId: text('discord_id').notNull().unique(),
	points: integer('points').notNull().default(0),
	username: text('username').notNull(),
	picture: text('picture'),
	admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
}, (table) => [
	uniqueIndex('discord_id_index').on(table.discordId)
]);

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;