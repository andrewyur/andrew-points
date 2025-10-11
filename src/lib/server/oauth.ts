import { Discord } from "arctic";
import { DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID, APP_URL } from "$env/static/private";

export const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, `${APP_URL}/login/discord/callback`)