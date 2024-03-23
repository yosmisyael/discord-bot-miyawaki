import {
    Attachment, AttachmentBuilder,
    ContextMenuCommandInteraction,
} from "discord.js";
import * as fs from "fs";
import {CommandExt} from "../model/command";
import axios, {AxiosResponse} from "axios";
import * as path from "path";

const getImageExtension = (imgUrl: string) => imgUrl.split("?")[0].split(".").pop();


async function handleImage(image: Attachment): Promise<string | undefined> {
    const imageUrl: string = image.url;
    const validExtension: string[] = ['jpg', 'jpeg', 'png'];
    const imageExtension: string | undefined = getImageExtension(imageUrl);
    const imageDir: string = path.join(__dirname, "../../image");

    if (imageExtension && !validExtension.includes(imageExtension)) throw new Error("Unsupported image extension.");

    try {
        const response: AxiosResponse = await axios.get(imageUrl, { responseType: "arraybuffer"});
        const imgBuffer: Buffer = Buffer.from(response.data, "binary");
        await fs.promises.writeFile(path.join(imageDir, `image.${imageExtension}`), imgBuffer);
        return path.join(imageDir, `image.${imageExtension}`);
    } catch (e: unknown) {
        console.log(`Error occurred when saving image: ${e as string}`);
    }
}

export default {
    data: new CommandExt()
        .setName("rmbg")
        .setDescription("Remove background from image.")
        .addAttachmentOption((options) => options
            .setRequired(true)
            .setName("image")
            .setDescription("image to remove background")),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        const attachment: Attachment = interaction.options.getAttachment("image") as Attachment;
        const result: string | undefined = await handleImage(attachment);
        if (!result) {
            await interaction.reply("Sorry, an error occurred when trying to remove your image background, please try again.");
            return;
        }
        const replyAttachment = new AttachmentBuilder(result);
        await interaction.reply({
            content: "Here is your removed background image.",
            files: [replyAttachment]
        })
    }
};
