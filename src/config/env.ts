import dotenv from "dotenv";
import {envType} from "../type/app-type";

dotenv.config();

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    throw new Error("missing environment variables");
}

export const env: envType = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID
} as envType;
