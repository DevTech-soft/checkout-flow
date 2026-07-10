import 'react-native-gesture-handler/jestSetup';
import { enableScreens } from 'react-native-screens';

enableScreens(false);

jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});
