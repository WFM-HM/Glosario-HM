import type { Data } from './types'

const IV_LENGTH = 12

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
    }

    return bytes
}

export async function getAESKey(keyString: string): Promise<CryptoKey> {
    let keyBytes: Uint8Array<ArrayBuffer>

    try {
        keyBytes = base64ToBytes(keyString)
    } catch {
        throw new Error('The encryption key is not valid Base64.')
    }

    if (keyBytes.length !== 32) {
        throw new Error('The encryption key must be 32 bytes (256 bits).')
    }

    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    )
}

export async function decryptData(text: string, key: string): Promise<Data> {
    if (!text) {
        throw new Error('No ciphertext to decrypt.')
    }

    const encryptedBytes = base64ToBytes(text)

    if (encryptedBytes.length <= IV_LENGTH) {
        throw new Error('The ciphertext is too short.')
    }

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: encryptedBytes.slice(0, IV_LENGTH),
            tagLength: 128,
        },
        await getAESKey(key),
        encryptedBytes.slice(IV_LENGTH)
    )

    return JSON.parse(new TextDecoder().decode(decrypted)) as Data
}
