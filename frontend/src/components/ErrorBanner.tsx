import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';

type ErrorBannerProps = {
  message: string;
};

function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF2F2',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    color: colors.error,
    fontSize: typography.body.fontSize,
  },
});

export default ErrorBanner;
