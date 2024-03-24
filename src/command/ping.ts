import {Interaction} from "discord.js";
import {CommandExt} from "../model/command";

export default {
    data: new CommandExt()
        .setName("ping")
        .setDescription("reply with bot greeting"),
    async execute(interaction: Interaction): Promise<void> {
        if (interaction.isRepliable()) interaction.reply({
            content: "Hi babe!"
        });
    }
}