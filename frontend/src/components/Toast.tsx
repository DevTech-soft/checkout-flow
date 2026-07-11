import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';

export type ToastVariant = 'success' | 'error';

type ToastProps = {
  message: string;
  variant: ToastVariant;
};

function Toast({ message, variant }: ToastProps) {
  return (
    <View
      style={[
        styles.container,
        variant === 'error' ? styles.error : styles.success,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    borderRadius: 8,
    padding: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  error: {
    backgroundColor: colors.error,
  },
  success: {
    backgroundColor: colors.success,
  },
  text: {
    color: colors.background,
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
});

export default Toast;
