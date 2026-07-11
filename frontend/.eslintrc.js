module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['coverage/**'],
  settings: {
    'import/resolver': {
      'babel-module': {
        alias: {
          '@app': './src/app',
          '@navigation': './src/navigation',
          '@features': './src/features',
          '@components': './src/components',
          '@services': './src/services',
          '@redux': './src/redux',
          '@hooks': './src/hooks',
          '@storage': './src/storage',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@assets': './src/assets',
        },
      },
    },
  },
  overrides: [
    {
      files: ['jest.setup.js', 'jest.config.js'],
      env: { jest: true },
    },
  ],
};
