import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import ErrorBanner from '@components/ErrorBanner';
import CardBrandBadge from '@components/CardBrandBadge';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { selectOrder } from '@redux/slices/order.slice';
import { selectProductById } from '@redux/slices/products.slice';
import { selectCustomer } from '@redux/slices/checkout.slice';
import { selectCard } from '@redux/slices/card.slice';
import {
  selectTransaction,
  submitTransaction,
} from '@redux/slices/transaction.slice';
import { formatCurrency } from '@utils/currency';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

function PaymentSummaryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);
  const product = useAppSelector(selectProductById(order.productId));
  const customer = useAppSelector(selectCustomer);
  const card = useAppSelector(selectCard);
  const transaction = useAppSelector(selectTransaction);

  const submitting = transaction.requestStatus === 'loading';

  const handlePay = async () => {
    await dispatch(submitTransaction());
    navigation.navigate('TransactionResult');
  };

  if (!product || !order.quantity || !customer || !card) {
    return (
      <ScreenContainer>
        <ErrorBanner message="No hay datos suficientes para confirmar el pago." />
      </ScreenContainer>
    );
  }

  const total = product.priceInCents * order.quantity;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Confirma tu pago</Text>

      <Text style={styles.sectionTitle}>Producto</Text>
      <Text style={styles.line}>
        {product.name} x{order.quantity}
      </Text>
      <Text style={styles.total}>
        {formatCurrency(total, product.currency)}
      </Text>

      <Text style={styles.sectionTitle}>Datos del cliente</Text>
      <Text style={styles.line}>{customer.fullName}</Text>
      <Text style={styles.line}>{customer.email}</Text>
      <Text style={styles.line}>{customer.phoneNumber}</Text>

      <Text style={styles.sectionTitle}>Tarjeta</Text>
      <CardBrandBadge brand={card.brand} />
      <Text style={styles.line}>{card.cardHolder}</Text>
      <Text style={styles.line}>•••• •••• •••• {card.lastFourDigits}</Text>
      <Text style={styles.line}>Vence {card.expiryDate}</Text>

      {transaction.error ? <ErrorBanner message={transaction.error} /> : null}

      <Button
        title="Pagar"
        onPress={handlePay}
        loading={submitting}
        disabled={submitting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  line: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  total: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default PaymentSummaryScreen;
