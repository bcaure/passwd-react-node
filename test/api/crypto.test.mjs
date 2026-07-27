import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const TEST_KEY = 'MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=';

function loadCrypto({ withKey = true } = {}) {
    if (withKey) {
        process.env.ENCRYPTION_KEY = TEST_KEY;
    }
    const modulePath = path.join(ROOT, 'back/crypto.js');
    delete require.cache[require.resolve(modulePath)];
    return require(modulePath);
}

export function runCryptoTests() {
    const { encrypt, decrypt, isEncrypted } = loadCrypto();

    const plaintext = 'my-secret-password';
    const encrypted = encrypt(plaintext);

    assert.ok(isEncrypted(encrypted), 'encrypted value should use the enc:v1: prefix');
    assert.notEqual(encrypted, plaintext, 'ciphertext should differ from plaintext');
    assert.equal(decrypt(encrypted), plaintext, 'decrypt should restore the original password');
    assert.equal(decrypt(plaintext), plaintext, 'plaintext values should pass through during migration');

    const encryptedAgain = encrypt(encrypted);
    assert.equal(encryptedAgain, encrypted, 'encrypting an already encrypted value should be a no-op');

    assert.equal(encrypt(''), '', 'empty strings should remain empty');
    assert.equal(decrypt(''), '', 'decrypting empty strings should remain empty');

    delete process.env.ENCRYPTION_KEY;
    const cryptoWithoutKey = loadCrypto({ withKey: false });
    assert.throws(
        () => cryptoWithoutKey.encrypt('secret'),
        /ENCRYPTION_KEY environment variable is required/,
        'missing ENCRYPTION_KEY should fail fast'
    );
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    runCryptoTests();
    console.log('Crypto unit tests passed.');
}
