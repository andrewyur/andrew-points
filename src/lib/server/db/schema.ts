import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	googleId: text('google_id').notNull().unique(),
	points: integer('points').notNull().default(0),
	name: text('name').notNull(),
	email: text('email').notNull(),
	picture: text('picture').notNull(),
	admin: integer('admin', { mode: 'boolean' }).notNull().default(false),
}, (table) => [
	uniqueIndex('google_id_index').on(table.googleId)
]);

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;