import {CommandExt} from "../model/command";
import {ContextMenuCommandInteraction} from "discord.js";

export default {
    data: new CommandExt()
        .setName("translate")
        .setDescription("Translate a given English text into Indonesia.")
        .addStringOption((options) => options
            .setRequired(true)
            .setName("text")
            .setDescription("Text to translate.")
        ),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        const text: string = interaction.options.get("text")?.value as string;
        console.log(text);
    }

}