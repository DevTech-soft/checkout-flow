import AsyncStorage from '@react-native-async-storage/async-storage';

async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const asyncStorageAdapter = {
  getItem,
  setItem,
  removeItem,
};
