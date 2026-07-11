import Config from 'react-native-config';
import CryptoJS from 'crypto-js';
import { asyncStorageAdapter } from './asyncStorageAdapter';

function getEncryptionKey(): string {
  const key = Config.REDUX_PERSIST_KEY;
  if (!key) {
    throw new Error(
      'REDUX_PERSIST_KEY is not set. Define it in your .env file before using secureStorage.',
    );
  }
  return key;
}

function encrypt<T>(value: T): string {
  const json = JSON.stringify(value);
  return CryptoJS.AES.encrypt(json, getEncryptionKey()).toString();
}

function decrypt<T>(cipherText: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, getEncryptionKey());
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) {
      return null;
    }
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function getItem<T>(key: string): Promise<T | null> {
  const cipherText = await asyncStorageAdapter.getItem<string>(key);
  if (!cipherText) {
    return null;
  }
  return decrypt<T>(cipherText);
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await asyncStorageAdapter.setItem(key, encrypt(value));
}

async function removeItem(key: string): Promise<void> {
  await asyncStorageAdapter.removeItem(key);
}

export const secureStorage = {
  getItem,
  setItem,
  removeItem,
};
