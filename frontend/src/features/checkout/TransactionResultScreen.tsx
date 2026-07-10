import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

function TransactionResultScreen({ route, navigation }: Props) {
  const { status, message } = route.params;
  const isSuccess = status === 'success';

  const handleGoHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <ScreenContainer>
      <Text style={[styles.icon, isSuccess ? styles.success : styles.error]}>
        {isSuccess ? '✓' : '✕'}
      </Text>
      <Text style={styles.title}>
        {isSuccess ? 'Pago exitoso' : 'No pudimos procesar tu pago'}
      </Text>
      <Text style={styles.message}>
        {message ??
          (isSuccess
            ? 'Tu transacción fue aprobada.'
            : 'Intenta nuevamente o usa otra tarjeta.')}
      </Text>
      <Button title="Volver al inicio" onPress={handleGoHome} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  success: {
    color: colors.success,
  },
  error: {
    color: colors.error,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default TransactionResultScreen;
