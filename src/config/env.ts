import dotenv from "dotenv";
import {envType} from "../type/app-type";
import * as process from "process";

dotenv.config();

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID || !process.env.GENIUS_ACCESS_TOKEN) {
    throw new Error("missing environment variables");
}

export const env: envType = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    GENIUS_ACCESS_TOKEN: process.env.GENIUS_ACCESS_TOKEN
} as envType;
