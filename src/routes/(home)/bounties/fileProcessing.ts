import fs from 'fs/promises';
import { spawn } from 'child_process';
import sharp from 'sharp';
import path from 'path';


export async function proceessMedia(file: File, outputFolder: string, filename: string): Promise<{
    width: number,
    height: number,
    type: 'image' | 'video'
}> {
    const buffer = Buffer.from(await file.arrayBuffer())
    let dimensions;
    let type: 'image' | 'video';

    if (file.type.startsWith("image/")) {
        dimensions = await processAndSaveImage(buffer, outputFolder, filename)
        type = "image"
    } else if (file.type.startsWith("video/")) {
        const fileExtension = file.name.split('.').at(-1)!;
        dimensions = await processAndSaveVideo(buffer, fileExtension, outputFolder, filename)
        type = "video"
    } else {
        throw new Error("File is not a video or image");
    }

    return {
        ...dimensions,
        type
    }
}


async function processAndSaveVideo(inputBuffer: Buffer, inFileExtension: string, outputFolder: string, outFileName: string,): Promise<{ width: number, height: number }> {
    const tmpInput = `tmp_input.${inFileExtension}`;
    const outputPath = path.join(outputFolder, `${outFileName}.mp4`)

    await fs.writeFile(tmpInput, inputBuffer);

    await new Promise<void>((resolve, reject) => {

        const ffmpeg = spawn('ffmpeg', [
            '-i', tmpInput,
            '-t', '360',
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            '-y',
            outputPath
        ], {
            stdio: ["ignore", "pipe", "pipe"]
        });
        // ffmpeg.stderr.on('data', d => console.error(d.toString()));
        ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
    });

    const dimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
        const ffprobe = spawn("ffprobe", [
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0:s=x",
            outputPath,
        ]);

        let output = "";
        ffprobe.stdout.on("data", (data) => {
            output += data.toString();
        });

        ffprobe.stderr.on('data', d => console.error(d.toString()));

        ffprobe.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`ffprobe exited with code ${code}`));
            }
            const [width, height] = output.trim().split("x").map(Number);
            resolve({ width, height });
        });
    });

    await fs.unlink(tmpInput)

    return dimensions
}


async function processAndSaveImage(inputBuffer: Buffer, outputFolder: string, fileName: string): Promise<{ width: number, height: number }> {
    const buffer = await sharp(inputBuffer)
        .resize({ width: 1280, height: 720, fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();

    const metadata = await sharp(buffer).metadata();

    const outputPath = path.join(outputFolder, fileName + ".webp");

    await fs.writeFile(outputPath, buffer);

    return {
        width: metadata.width,
        height: metadata.height
    }
}
