jest.mock('./asyncStorageAdapter');

import { asyncStorageAdapter } from './asyncStorageAdapter';
import { secureStorage } from './secureStorage';

const mockedAdapter = asyncStorageAdapter as jest.Mocked<
  typeof asyncStorageAdapter
>;

describe('secureStorage', () => {
  beforeEach(() => {
    mockedAdapter.getItem.mockReset();
    mockedAdapter.setItem.mockReset();
    mockedAdapter.removeItem.mockReset();
  });

  it('round-trips a value through AES encryption', async () => {
    let stored: string | null = null;
    mockedAdapter.setItem.mockImplementation(async (_key, value) => {
      stored = value as string;
    });
    mockedAdapter.getItem.mockImplementation(async () => stored);

    const value = { foo: 'bar', count: 2 };
    await secureStorage.setItem('key', value);

    expect(stored).not.toEqual(JSON.stringify(value));
    expect(typeof stored).toBe('string');

    const result = await secureStorage.getItem('key');

    expect(result).toEqual(value);
  });

  it('returns null when there is nothing stored', async () => {
    mockedAdapter.getItem.mockResolvedValue(null);

    const result = await secureStorage.getItem('missing');

    expect(result).toBeNull();
  });

  it('returns null when the stored ciphertext cannot be decrypted', async () => {
    mockedAdapter.getItem.mockResolvedValue('not-valid-ciphertext');

    const result = await secureStorage.getItem('key');

    expect(result).toBeNull();
  });

  it('delegates removeItem to the underlying adapter', async () => {
    await secureStorage.removeItem('key');

    expect(mockedAdapter.removeItem).toHaveBeenCalledWith('key');
  });
});

describe('secureStorage without an encryption key configured', () => {
  afterEach(() => {
    jest.dontMock('react-native-config');
    jest.resetModules();
  });

  it('throws when REDUX_PERSIST_KEY is not set', async () => {
    jest.resetModules();
    jest.doMock('react-native-config', () => ({
      API_BASE_URL: 'http://localhost:3000',
      REDUX_PERSIST_KEY: undefined,
    }));
    const secureStorageWithoutKey: typeof secureStorage =
      require('./secureStorage').secureStorage;

    await expect(
      secureStorageWithoutKey.setItem('key', { foo: 'bar' }),
    ).rejects.toThrow('REDUX_PERSIST_KEY is not set');
  });
});
