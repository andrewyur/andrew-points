import { encodeBase32LowerCase } from "@oslojs/encoding";
import { db } from "$lib/server/db";
import * as table from "$lib/server/db/schema"

export async function createUser(discordId: string, username: string, avatarHash: string | null): Promise<table.User> {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);

    const picture = avatarHash ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128` : null

    const [user] = await db.insert(table.user).values({
        id,
        discordId,
        username,
        picture
    }).returning();

    return user;
}

export async function updateUserAvatar(discordId: string, avatarHash: string) {
    const picture = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128`

    db.update(table.user).set({
        picture
    })
}

export async function getUserFromDiscordId(discordId: string): Promise<table.User | undefined> {
    return await db.query.user.findFirst({
        where: (fields, { eq }) => eq(fields.discordId, discordId)
    })
}