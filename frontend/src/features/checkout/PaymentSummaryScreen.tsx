import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import LoadingIndicator from '@components/LoadingIndicator';
import CardBrandBadge from '@components/CardBrandBadge';
import { getProductById } from '@services/products/productService';
import type { Product } from '@services/products/product.types';
import { formatCurrency } from '@utils/currency';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

const SUBMIT_DELAY_MS = 800;

function PaymentSummaryScreen({ route, navigation }: Props) {
  const { productId, quantity, customer, card } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getProductById(productId).then(result => {
      if (isMounted) {
        setProduct(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handlePay = () => {
    setSubmitting(true);
    setTimeout(() => {
      navigation.navigate('TransactionResult', { status: 'success' });
    }, SUBMIT_DELAY_MS);
  };

  if (loading || !product) {
    return (
      <ScreenContainer>
        <LoadingIndicator label="Cargando resumen..." />
      </ScreenContainer>
    );
  }

  const total = product.priceInCents * quantity;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Confirma tu pago</Text>

      <Text style={styles.sectionTitle}>Producto</Text>
      <Text style={styles.line}>
        {product.name} x{quantity}
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
