export async function computeFileHash(file: ArrayBuffer | File): Promise<string> {
    let buffer: ArrayBuffer;

    if (file instanceof File) {
        buffer = await file.arrayBuffer();
    } else {
        buffer = file;
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}