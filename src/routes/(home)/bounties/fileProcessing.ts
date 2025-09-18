import fs from 'fs/promises';
import { spawn } from 'child_process';
import sharp from 'sharp';
import path from 'path';


export async function proceessMedia(file: File, outputFolder: string, filename: string) {
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type.startsWith("image/")) {
        await processAndSaveImage(buffer, outputFolder, filename)
    } else if (file.type.startsWith("video/")) {
        const fileExtension = file.name.split('.').at(-1)!;
        await processAndSaveVideo(buffer, fileExtension, outputFolder, filename)
    } else {
        throw new Error("File is not a video or image");
    }
}


async function processAndSaveVideo(inputBuffer: Buffer, inFileExtension: string, outputFolder: string, outFileName: string,): Promise<void> {
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

    await fs.unlink(tmpInput)
}


async function processAndSaveImage(inputBuffer: Buffer, outputFolder: string, fileName: string): Promise<void> {
    let buffer = await sharp(inputBuffer)
        .resize({ width: 1280, height: 720, fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer();

    const outputPath = path.join(outputFolder, fileName + ".webp");

    await fs.writeFile(outputPath, buffer);
}
