const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:v1:';

function getKey() {
    const keyB64 = process.env.ENCRYPTION_KEY;
    if (!keyB64) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    const key = Buffer.from(keyB64, 'base64');
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be a base64-encoded 32-byte key');
    }

    return key;
}

function validateKey() {
    getKey();
}

function isEncrypted(value) {
    return typeof value === 'string' && value.startsWith(PREFIX);
}

function encrypt(plaintext) {
    if (plaintext == null || plaintext === '') {
        return plaintext;
    }

    if (isEncrypted(plaintext)) {
        return plaintext;
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, authTag, ciphertext]);

    return `${PREFIX}${payload.toString('base64')}`;
}

function decrypt(value) {
    if (value == null || value === '') {
        return value;
    }

    if (!isEncrypted(value)) {
        return value;
    }

    const key = getKey();
    const payload = Buffer.from(value.slice(PREFIX.length), 'base64');

    if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
        throw new Error('Invalid encrypted password payload');
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]).toString('utf8');
}

module.exports = {
    PREFIX,
    validateKey,
    isEncrypted,
    encrypt,
    decrypt
};
