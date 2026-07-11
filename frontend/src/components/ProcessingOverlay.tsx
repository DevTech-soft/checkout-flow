import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';

type ProcessingOverlayProps = {
  visible: boolean;
  message?: string;
};

function ProcessingOverlay({
  visible,
  message = 'Procesando tu pago...',
}: ProcessingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>
            No cierres la app ni regreses a la pantalla anterior.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default ProcessingOverlay;
