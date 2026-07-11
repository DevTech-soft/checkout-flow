import { useEffect } from 'react';
import { BackHandler, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import ErrorBanner from '@components/ErrorBanner';
import ProcessingOverlay from '@components/ProcessingOverlay';
import { useToast } from '@components/ToastProvider';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { selectOrderLines, selectOrderTotal } from '@redux/slices/order.slice';
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

const BRAND_LABEL: Record<string, string> = {
  VISA: 'VISA',
  MASTERCARD: 'Mastercard',
  UNKNOWN: '',
};

function PaymentSummaryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const lines = useAppSelector(selectOrderLines);
  const total = useAppSelector(selectOrderTotal);
  const customer = useAppSelector(selectCustomer);
  const card = useAppSelector(selectCard);
  const transaction = useAppSelector(selectTransaction);

  const submitting = transaction.requestStatus === 'loading';

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !submitting,
      headerBackVisible: !submitting,
    });
  }, [navigation, submitting]);

  useEffect(() => {
    if (!submitting) {
      return undefined;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => subscription.remove();
  }, [submitting]);

  const handlePay = async () => {
    const result = await dispatch(submitTransaction());
    if (submitTransaction.rejected.match(result)) {
      showToast(result.payload ?? 'No pudimos procesar tu pago.');
    }
    navigation.navigate('TransactionResult');
  };

  if (lines.length === 0 || !customer || !card) {
    return (
      <ScreenContainer>
        <ErrorBanner message="No hay datos suficientes para confirmar el pago." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Confirma tu pago</Text>

      <Text style={styles.sectionTitle}>Resumen del pedido</Text>
      <View style={styles.card}>
        {lines.map(line => (
          <View key={line.product.id} style={styles.productRow }>
            <Image
              source={{ uri: line.product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {line.product.name}
              </Text>
              <Text style={styles.productMeta}>
                {formatCurrency(line.product.priceInCents, line.product.currency)}{' '}
                c/u
              </Text>
            </View>
            <Text style={styles.productQty}>x{line.quantity}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Datos de contacto</Text>
      <View style={styles.card}>
        <Text style={styles.primaryLine}>{customer.fullName}</Text>
        <Text style={styles.mutedLine}>{customer.email}</Text>
        <Text style={styles.mutedLine}>{customer.phoneNumber}</Text>
      </View>

      <Text style={styles.sectionTitle}>Método de pago</Text>
      <View style={styles.card}>
        <View style={styles.paymentRow}>
          <Text style={styles.maskedNumber}>
            •••• •••• •••• {card.lastFourDigits}
          </Text>
          {BRAND_LABEL[card.brand] ? (
            <View style={styles.brandPill}>
              <Text style={styles.brandPillText}>
                {BRAND_LABEL[card.brand]}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.mutedLine}>{card.cardHolder}</Text>
        <Text style={styles.mutedLine}>Vence {card.expiryDate}</Text>
      </View>

      <Text style={styles.sectionTitle}>Desglose</Text>
      <View style={styles.card}>
        {lines.map(line => (
          <View key={line.product.id} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              {line.product.name} x{line.quantity}
            </Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(
                line.product.priceInCents * line.quantity,
                line.product.currency,
              )}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(total, lines[0].product.currency)}
          </Text>
        </View>
      </View>

      {transaction.error ? <ErrorBanner message={transaction.error} /> : null}

      <View style={styles.buttonWrapper}>
        <Button
          title="Pagar"
          onPress={handlePay}
          loading={submitting}
          disabled={submitting}
          pill
        />
      </View>

      <ProcessingOverlay visible={submitting} />
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
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  productName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  productMeta: {
    marginTop: spacing.xs / 2,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  productQty: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.textMuted,
  },
  primaryLine: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  mutedLine: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  maskedNumber: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  brandPill: {
    backgroundColor: colors.background,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  brandPillText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  breakdownValue: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
});

export default PaymentSummaryScreen;
