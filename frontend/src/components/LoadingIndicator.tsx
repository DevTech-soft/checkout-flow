import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';

type LoadingIndicatorProps = {
  label?: string;
};

function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
});

export default LoadingIndicator;
