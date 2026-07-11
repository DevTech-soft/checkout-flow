import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { selectTransaction, resetTransaction } from '@redux/slices/transaction.slice';
import { clearOrder } from '@redux/slices/order.slice';
import { clearCart } from '@redux/slices/cart.slice';
import { clearCustomer } from '@redux/slices/checkout.slice';
import { clearCard } from '@redux/slices/card.slice';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

function TransactionResultScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const transaction = useAppSelector(selectTransaction);
  const isSuccess = transaction.status === 'APPROVED';

  const handleGoHome = () => {
    dispatch(resetTransaction());
    dispatch(clearOrder());
    dispatch(clearCart());
    dispatch(clearCustomer());
    dispatch(clearCard());
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
        {transaction.error ??
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
