import { Discord } from "arctic";
import { DISCORD_CLIENT_SECRET, DISCORD_CLIENT_ID } from "$env/static/private";

export const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, "http://testdomain.nut:5173/login/discord/callback")