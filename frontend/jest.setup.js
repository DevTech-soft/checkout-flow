import 'react-native-gesture-handler/jestSetup';
import { enableScreens } from 'react-native-screens';

enableScreens(false);

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000',
  REDUX_PERSIST_KEY: 'test-persist-key-0123456789abcdef',
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
