import { eq } from "drizzle-orm";
import { db } from "./db";
import * as table from "./db/schema"

export async function getUserFromId(id: string) {
    return await db.query.user.findFirst({
        where: eq(table.user.id, id)
    });
}

export async function getAllUsers() {
    return await db.query.user.findMany()
}

export async function createUser(discordId: string, username: string, avatarHash: string | null) {

    const picture = avatarHash ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128` : null

    const [user] = await db.insert(table.user).values({
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

export async function getUserFromDiscordId(discordId: string) {
    return await db.query.user.findFirst({
        where: eq(table.user.discordId, discordId)
    })
}

export async function userExists(id: string) {
    const user = await getUserFromId(id);

    return user != undefined
}