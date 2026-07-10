module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
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
    ],
  ],
};
