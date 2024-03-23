import {promises as fs} from "fs";

export async function importAllCommand(filepath: string): Promise<any> {
    try {
        const module = await import(filepath);
        return module.default || module;
    } catch (e) {
        console.error(`Error importing command from ${filepath}`, e);
        throw e;
    }
}