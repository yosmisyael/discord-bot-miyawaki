import {CommandExt} from "../model/command";
import {ContextMenuCommandInteraction} from "discord.js";
import { translate } from 'google-translate-api-browser';

export default {
    data: new CommandExt()
        .setName("translate")
        .setDescription("Translate English or other languages into Indonesian.")
        .addStringOption((options) => options
            .setRequired(true)
            .setName("text")
            .setDescription("Text to translate.")
        )
        .addBooleanOption((options) => options
            .setName("auto-detect")
            .setDescription("Set it to true to use the auto-detect language feature.")
            .setRequired(false)),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        const input: string = interaction.options.get("text")?.value as string;
        const isAuto: boolean = interaction.options.get("auto-detect")?.value as boolean;
        const {text}: {text: string} = await translate(input, {from: isAuto ? "auto" : "en", to: "id"});
        await interaction.reply(text);
    }

}