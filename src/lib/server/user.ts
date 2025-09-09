import { encodeBase32LowerCase } from "@oslojs/encoding";
import { db } from "./db";
import * as table from "$lib/server/db/schema"

export async function createUser(googleId: string, email: string, name: string, picture: string): Promise<table.User> {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);

    const [user] = await db.insert(table.user).values({
        id,
        googleId,
        name,
        email,
        picture
    }).returning();

    return user;
}

export async function getUserFromGoogleId(googleId: string): Promise<table.User | undefined> {
    return await db.query.user.findFirst({
        where: (fields, { eq }) => eq(fields.googleId, googleId)
    })
}