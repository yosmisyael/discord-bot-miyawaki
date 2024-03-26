import type {Options} from "tsup";

export const tsup: Options = {
    splitting: true,
    clean: true,
    entryPoints: ["src/index.ts"],
    target: "es6",
    entry: ["src/**/*.ts"],
    outDir: "./dist",
}