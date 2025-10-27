import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { sql } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(client, { schema });

export type DatabaseTransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0]

// https://github.com/drizzle-team/drizzle-orm/issues/1723
// this issue has been open for 2 years bruh...
export async function runTransaction<T>(
    callback: () => Promise<T>,
): Promise<T> {
    db.run(sql.raw(`BEGIN`));

    try {
        const result = await callback();
        db.run(sql.raw(`COMMIT`));
        return result;
    } catch (error) {
        db.run(sql.raw(`ROLLBACK`));
        throw error;
    }
}