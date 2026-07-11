import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageAdapter } from './asyncStorageAdapter';

describe('asyncStorageAdapter', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('serializes values as JSON when setting an item', async () => {
    await asyncStorageAdapter.setItem('key', { foo: 'bar' });

    const raw = await AsyncStorage.getItem('key');

    expect(raw).toBe(JSON.stringify({ foo: 'bar' }));
  });

  it('deserializes stored JSON when getting an item', async () => {
    await AsyncStorage.setItem('key', JSON.stringify({ foo: 'bar' }));

    const result = await asyncStorageAdapter.getItem('key');

    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns null when the key does not exist', async () => {
    const result = await asyncStorageAdapter.getItem('missing');

    expect(result).toBeNull();
  });

  it('removes an item', async () => {
    await asyncStorageAdapter.setItem('key', { foo: 'bar' });
    await asyncStorageAdapter.removeItem('key');

    const result = await asyncStorageAdapter.getItem('key');

    expect(result).toBeNull();
  });
});
