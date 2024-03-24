import {
    Attachment, AttachmentBuilder,
    ContextMenuCommandInteraction,
} from "discord.js";
import * as fs from "fs";
import {CommandExt} from "../model/command";
import axios, {AxiosResponse} from "axios";
import * as path from "path";
import * as buffer from "buffer";
import {v4 as uuid} from "uuid";

const getImageExtension = (imgUrl: string) => imgUrl.split("?")[0].split(".").pop()?.toLowerCase();

async function convertImageToBlob(imagePath: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(imagePath);
        const chunks: buffer.Buffer[] = [];
        stream.on("data", (chunk) => {
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
        const formRequest: FormData = new FormData();
        const imageBlob: Blob = await convertImageToBlob(path.join(imageDir, `image.${imageExtension}`));
        formRequest.append("image", imageBlob);
        const rmbgResponse: AxiosResponse = await axios.post("http://127.0.0.1:5100", formRequest, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            responseType: "stream"
        });
        if (rmbgResponse.status !== 200) {
            throw new Error("Failed get result from rmbg api");
        }
        const filename = uuid() + ".png";
        await rmbgResponse.data.pipe(fs.createWriteStream(path.join(imageDir, `output/${filename}`)));
        console.log("downloaded")
        return path.join(imageDir, `output/${filename}`);
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
        await interaction.deferReply();
        const attachment: Attachment = interaction.options.getAttachment("image") as Attachment;
        try {
            const result: string | undefined = await handleImage(attachment);

            if (!result) {
                await interaction.editReply({ content: "Sorry, an error occurred during background removal." });
                return;
            }
            const replyAttachment: AttachmentBuilder = new AttachmentBuilder(path.join(__dirname, "../../image/output/background_removed.png"));
            await interaction.followUp({
                content: "Here is your removed background image.",
                files: [replyAttachment],
            });

        } catch (error) {
            console.error("Error:", error);
            await interaction.editReply({ content: "An error occurred. Please try again later." });
        }

    }
};
