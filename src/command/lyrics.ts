import {CommandExt} from "../model/command";
import {ContextMenuCommandInteraction, EmbedBuilder, SlashCommandStringOption} from "discord.js";
import axios, {AxiosResponse} from "axios";
import {env} from "../config/env";
import cheerio from "cheerio";

export default {
    data: new CommandExt()
        .setName("lyrics")
        .setDescription("Find lyrics of a given song title.")
        .addStringOption((options: SlashCommandStringOption) => options
            .setRequired(true)
            .setName("title")
            .setDescription("title of the song")),
    async execute(interaction: ContextMenuCommandInteraction) {
        const title: string = interaction.options.get("title")?.value as string;
        const response: AxiosResponse = await axios.get("https://api.genius.com/search", {
            headers: {
                "Authorization": `Bearer ${env.GENIUS_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            params: {
                q: title
            }
        });
        if (response.data.response.hits.length > 0) {
            await interaction.deferReply();
            const lyricUrl: string = response.data.response.hits[0].result.url
            const {data} = await axios.get(lyricUrl);
            const $: cheerio.Root = cheerio.load(data);
            let lyrics: string = $('div[class="lyrics"]').text().trim();
            if (!lyrics) {
                lyrics = "";
                $('div[class^="Lyrics__Container"]').each((_:number, element: cheerio.Element): void => {
                    if ($(element).text().length > 0) {
                        const snippet: string = $(element)
                            .html()!
                            .replace(/<br>/g, "\n")
                            .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, "");
                        lyrics += $("body").html(snippet).text().trim() + "\n\n";
                    }
                });
            }
            if (!lyrics) {
                await interaction.followUp("Sorry, the lyrics of the song you are looking for is not available.")
            }

            const lyricsChunks: string[] = lyrics.split(/\n\n/);

            for (const part of lyricsChunks) {
                if (part.trim()) {
                    const embed: EmbedBuilder = new EmbedBuilder()
                        .setTitle(response.data.response.hits[0].result.url)
                        .setDescription(part.trim());
                    await interaction.followUp({ embeds: [embed] });
                }
            }
        } else {
            await interaction.reply("Sorry, the lyrics of the song you are looking for is not available.")
        }
    }
}