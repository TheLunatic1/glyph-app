// Crypto utilities for Glyph Mobile
// Fully compatible with Glyph Desktop AES-256-GCM + Scrypt encryption
import * as Crypto from 'expo-crypto';
import base64js from 'base64-js';
import { scrypt } from '@noble/hashes/scrypt.js';
import { gcm } from '@noble/ciphers/aes.js';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils.js';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Safely converts Base64 string into Uint8Array handling newlines, CRLF, BOM, URL-safe and padding
 */
export function safeBase64ToBytes(b64) {
  if (!b64 || typeof b64 !== 'string') return new Uint8Array(0);
  let clean = b64.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  while (clean.length % 4 !== 0) {
    clean += '=';
  }
  return base64js.toByteArray(clean);
}

/**
 * Converts Uint8Array into clean Base64 string
 */
export function bytesToBase64(bytes) {
  return base64js.fromByteArray(bytes);
}

/**
 * Hash a string using SHA-256
 */
export async function hashString(value) {
  if (!value) return '';
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    value + '_glyph_secure_salt_v2'
  );
  return digest;
}

/**
 * AES-256-GCM Decryption (matching Desktop Glyph cryptoUtil.js)
 */
export function decryptDesktopGcm(encryptedBase64, password) {
  const data = safeBase64ToBytes(encryptedBase64);
  if (data.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid file format: payload too short');
  }

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Password variations to try: exact, trimmed, NFC normalized, NFKC normalized
  const candidatePasswords = Array.from(new Set([
    password,
    typeof password === 'string' ? password.trim() : password,
    typeof password === 'string' ? password.normalize('NFC') : password,
    typeof password === 'string' ? password.normalize('NFKC') : password
  ])).filter(Boolean);

  let lastError = null;

  for (const pwd of candidatePasswords) {
    try {
      const passwordBytes = typeof pwd === 'string' ? utf8ToBytes(pwd) : pwd;
      const key = scrypt(passwordBytes, salt, { N: 16384, r: 8, p: 1, dkLen: KEY_LENGTH });

      // In Noble AES-GCM, ciphertext is concatenated with tag at the end
      const combinedCiphertextAndTag = new Uint8Array(ciphertext.length + tag.length);
      combinedCiphertextAndTag.set(ciphertext, 0);
      combinedCiphertextAndTag.set(tag, ciphertext.length);

      const aesGcm = gcm(key, iv);
      const decryptedBytes = aesGcm.decrypt(combinedCiphertextAndTag);
      return bytesToUtf8(decryptedBytes);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Decryption failed');
}

/**
 * AES-256-GCM Encryption (matching Desktop Glyph cryptoUtil.js)
 */
export function encryptDesktopGcm(dataStr, password) {
  const salt = Crypto.getRandomBytes(SALT_LENGTH);
  const iv = Crypto.getRandomBytes(IV_LENGTH);

  const passwordBytes = typeof password === 'string' ? utf8ToBytes(password) : password;
  const key = scrypt(passwordBytes, salt, { N: 16384, r: 8, p: 1, dkLen: KEY_LENGTH });

  const aesGcm = gcm(key, iv);
  const encryptedWithTag = aesGcm.encrypt(utf8ToBytes(dataStr));

  const ciphertext = encryptedWithTag.subarray(0, encryptedWithTag.length - TAG_LENGTH);
  const tag = encryptedWithTag.subarray(encryptedWithTag.length - TAG_LENGTH);

  const totalLen = SALT_LENGTH + IV_LENGTH + TAG_LENGTH + ciphertext.length;
  const result = new Uint8Array(totalLen);
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(tag, SALT_LENGTH + IV_LENGTH);
  result.set(ciphertext, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  return bytesToBase64(result);
}

/**
 * Creates an encrypted .glyph backup payload 100% compatible with Glyph Desktop
 */
export async function createEncryptedBackup(payload, masterPassword) {
  const dataStr = JSON.stringify(payload.servers || payload);
  return encryptDesktopGcm(dataStr, masterPassword);
}

/**
 * Decrypts and validates a .glyph backup payload from Desktop or Mobile
 */
export async function decryptBackup(backupContent, masterPassword) {
  if (!backupContent || typeof backupContent !== 'string') {
    throw new Error('Empty or invalid backup file.');
  }

  const trimmed = backupContent.trim();

  // Case 1: Plain JSON Array of servers directly
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsedArray = JSON.parse(trimmed);
      return { servers: parsedArray };
    } catch (e) {}
  }

  // Case 2: Plain JSON Object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsedObj = JSON.parse(trimmed);
      if (parsedObj.servers && Array.isArray(parsedObj.servers)) {
        return parsedObj;
      }
      if (parsedObj.data && typeof parsedObj.data === 'string') {
        try {
          const dec = decryptDesktopGcm(parsedObj.data, masterPassword);
          const parsed = JSON.parse(dec);
          return Array.isArray(parsed) ? { servers: parsed } : parsed;
        } catch (innerErr) {}
      }
    } catch (err) {}
  }

  // Case 3: Desktop Glyph AES-256-GCM base64 format (Primary standard format)
  try {
    const decryptedStr = decryptDesktopGcm(trimmed, masterPassword);
    const cleanDecrypted = decryptedStr.replace(/^\uFEFF/, '').trim();
    const parsed = JSON.parse(cleanDecrypted);
    return Array.isArray(parsed) ? { servers: parsed } : parsed;
  } catch (gcmErr) {
    console.warn('GCM Decrypt attempt failed:', gcmErr);
  }

  // Case 4: File was read as raw JSON string wrapping base64
  try {
    const unwrapped = JSON.parse(trimmed);
    if (typeof unwrapped === 'string') {
      const decryptedStr = decryptDesktopGcm(unwrapped, masterPassword);
      const parsed = JSON.parse(decryptedStr.replace(/^\uFEFF/, '').trim());
      return Array.isArray(parsed) ? { servers: parsed } : parsed;
    }
  } catch (e) {}

  throw new Error('Incorrect master password or corrupted backup file.');
}
