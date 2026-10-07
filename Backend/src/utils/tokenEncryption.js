import crypto from 'crypto';
import dotenv from 'dotenv';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const encodedKey = process.env.DISCORD_TOKEN_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  }

  const key = Buffer.from(encodedKey, 'base64');

  if (key.length !== 32) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes'
    );
  }

  return key;
}

export function encryptToken(token) {
  if (!token) return null;

  const key = getKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv
  );

  const ciphertext = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64'),
    authTag.toString('base64'),
    ciphertext.toString('base64')
  ].join('.');
}

export function decryptToken(value) {
  if (!value) return null;

  const parts = value.split('.');

  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted token format');
  }

  const [, ivB64, tagB64, ciphertextB64] = parts;

  const key = getKey();

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, 'base64')
  );

  decipher.setAuthTag(
    Buffer.from(tagB64, 'base64')
  );

  const plaintext = Buffer.concat([
    decipher.update(
      Buffer.from(ciphertextB64, 'base64')
    ),
    decipher.final()
  ]);

  return plaintext.toString('utf8');
}