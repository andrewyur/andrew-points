import { sha256 } from '@oslojs/crypto/sha2';

export async function computeFileHash(file: File): Promise<string> {
    const hashBuffer = sha256(await file.bytes())
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}