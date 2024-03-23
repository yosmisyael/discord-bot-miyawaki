import {Client, Collection} from "discord.js";
import {CommandExt} from "../model/command";

export class ClientExt extends Client {
    public commands: Collection<string, CommandExt> = new Collection();
}