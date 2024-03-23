import {
    Events,
    GatewayIntentBits,
    Interaction,
    REST,
    Routes,
    Snowflake
} from "discord.js";
import {env} from "./config/env";
import {ClientExt} from "./model/client";
import * as path from "path";
import * as fs from "fs";
import {CommandExt} from "./model/command";

const client: ClientExt = new ClientExt({intents: [GatewayIntentBits.Guilds]});

const commandDirPath: string = path.join(__dirname, "command");
const commandFolders: string[] = fs.readdirSync(commandDirPath);

const rest: REST = new REST().setToken(env.DISCORD_TOKEN);
const commands: string[] = [];

(async function (): Promise<void> {
    for (const commandFile of commandFolders) {
        const commandFilePath = path.join(__dirname, `command/${commandFile}`);
        const command = require(commandFilePath).default;
        if (command.hasOwnProperty("data") && command.hasOwnProperty("execute")) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${commandFilePath} is missing a required "data" or "execute" property.`);
        }
    }

    try {
        await rest.put(
            Routes.applicationCommands(env.DISCORD_CLIENT_ID as Snowflake), {body: commands}
        )
        console.log(`[SUCCESS] All commands has been loaded.`)
    } catch (e: any) {
        console.error(`[ERROR] Failed to register commands: ${e.message}.`)
    }
})();

client.login(env.DISCORD_TOKEN);

client.on("ready", () => {
    console.log(`[SUCCESS] Logged in as ${client.user!.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const client: ClientExt = interaction.client as ClientExt;
    const command: CommandExt | undefined = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }

});
