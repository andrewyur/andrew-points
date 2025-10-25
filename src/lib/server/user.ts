import { eq } from "drizzle-orm";
import { db } from "./db";
import * as table from "./db/schema"
import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";
import { discordAnnouncement, fetchDisplayName } from "./discord";
import { createTransaction } from "./points";
import { createNotification } from "./notifications";
import { env } from "$env/dynamic/private";

export async function getUserFromId(id: string) {
    return await db.query.user.findFirst({
        where: eq(table.user.id, id)
    });
}

export async function getAllUsers() {
    return await db.query.user.findMany()
}

export async function createUser(discordId: string, username: string, avatarHash: string | null) {
    const allowList: string[] | null = env.ALLOWLIST?.split(',');

    if (allowList && !allowList.includes(username)) throw Error("User is not in allowlist! please come back later")

    const displayName = await fetchDisplayName(discordId)

    const picture = avatarHash ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256` : null

    const [user] = await db.insert(table.user).values({
        discordId,
        username,
        picture,
        displayName
    }).returning();

    await createTransaction(user.id, 20, { type: "admin", message: "Welcome!" })
    await discordAnnouncement({ type: "user_joined", userId: user.id })

    return user;
}

export async function updateUserAvatar(discordId: string, avatarHash: string) {
    const picture = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`

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

export function extractUser() {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(302, "/")
    }

    return locals.user;
}

export async function getAdmins() {
    return await db.query.user.findMany({
        where: eq(table.user.admin, true)
    })
}