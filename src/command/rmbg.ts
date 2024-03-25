import {
    Attachment, AttachmentBuilder,
    ContextMenuCommandInteraction, SlashCommandAttachmentOption,
} from "discord.js";
import * as fs from "fs";
import {CommandExt} from "../model/command";
import axios, {AxiosResponse} from "axios";
import * as path from "path";
import * as buffer from "buffer";

function getAndValidateImageExtension(imageUrl: string): { isValid: boolean; extension: string } {
    const imageExtension: string | undefined = imageUrl.split("?")[0].split(".").pop()?.toLowerCase();
    const validExtension: string[] = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (imageExtension && validExtension.includes(imageExtension)) {
        return {
            isValid: true,
            extension: imageExtension
        };
    } else {
        throw new Error("Unsupported image extension.")
    }
}

async function convertImageToBlob(imagePath: string): Promise<Blob> {
    return new Promise((resolve, reject): void => {
        const stream = fs.createReadStream(imagePath);
        const chunks: buffer.Buffer[] = [];
        stream.on("data", (chunk: string | buffer.Buffer): void => {
            if (!Buffer.isBuffer(chunk)) {
                chunks.push(Buffer.from(chunk))
            } else {
                chunks.push(chunk);
            }
        });
        stream.on("end", () => resolve(new Blob(chunks)));
        stream.on("error", (error: Error) => reject(error));
    })
}

async function downloadImage(imageUrl: string, outDir: string): Promise<string> {
    const response: AxiosResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    if (response.status !== 200) throw new Error("[ERROR] Failed download image.");
    const imageBuffer: Buffer = Buffer.from(response.data, "binary");
    await fs.promises.writeFile(path.join(outDir), imageBuffer);
    return outDir;
}

async function requestBackgroundRemoval(filePath: string) {
    const formRequest: FormData = new FormData();
    const imageBlob: Blob = await convertImageToBlob(filePath);
    formRequest.append("image", imageBlob);
    const response: AxiosResponse = await axios.post("http://127.0.0.1:5100", formRequest, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        responseType: "stream"
    });

    if (response.status !== 200) {
        throw new Error("[ERROR] Failed to get result from RMBG API.")
    }

    return response.data;
}

async function handleImage(image: Attachment): Promise<string | undefined> {
    const imageUrl: string = image.url;

    // get and validate image extension from discord
    const { extension }: { extension: string } = getAndValidateImageExtension(imageUrl);

    const imageDir: string = path.join(__dirname, "../../image");

    try {
        const downloadedImagePath: string = await downloadImage(imageUrl, path.join(imageDir, `image.${extension}`));
        const response = await requestBackgroundRemoval(downloadedImagePath);
        const filename: string = "removed_background.png";
        await fs.promises.writeFile(path.join(imageDir, `output/${filename}`), response);
        return path.join(imageDir, `output/${filename}`);
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.log(`[ERROR] ${e.message}`);
        }
    }
}

export default {
    data: new CommandExt()
        .setName("rmbg")
        .setDescription("Remove background from image. Supported image extensions are .jpg, .png, .webp, and .gif.")
        .addAttachmentOption((options: SlashCommandAttachmentOption) => options
            .setRequired(true)
            .setName("image")
            .setDescription("image to remove background")),
    async execute(interaction: ContextMenuCommandInteraction): Promise<void> {
        await interaction.deferReply();
        const attachment: Attachment = interaction.options.getAttachment("image") as Attachment;
        try {
            const result: string | undefined = await handleImage(attachment);
            if (!result) {
                await interaction.editReply({ content: "Sorry, an error occurred during background removal." });
                return;
            }
            const replyAttachment: AttachmentBuilder = new AttachmentBuilder(result);

            await interaction.followUp({
                content: "Here is your removed background image.",
                files: [replyAttachment],
            });

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`[Error] ${error.message}`);
            }
            await interaction.editReply({ content: "An error occurred. Please try again later." });
        }
    }
};
