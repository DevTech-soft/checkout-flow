import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import TextField from '@components/TextField';
import LoadingIndicator from '@components/LoadingIndicator';
import { getProductById } from '@services/products/productService';
import type { Product } from '@services/products/product.types';
import { formatCurrency } from '@utils/currency';
import {
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from '@utils/validators';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

type FormErrors = Partial<Record<'fullName' | 'email' | 'phoneNumber', string>>;

function CheckoutScreen({ route, navigation }: Props) {
  const { productId, quantity } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleContinue = () => {
    const nextErrors: FormErrors = {
      fullName: validateFullName(fullName) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phoneNumber: validatePhoneNumber(phoneNumber) ?? undefined,
    };
    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      return;
    }

    navigation.navigate('CardForm', {
      productId,
      quantity,
      customer: { fullName, email, phoneNumber },
    });
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
      <Text style={styles.title}>Resumen de compra</Text>
      <Text style={styles.summaryLine}>
        {product.name} x{quantity}
      </Text>
      <Text style={styles.total}>
        {formatCurrency(total, product.currency)}
      </Text>

      <Text style={styles.sectionTitle}>Tus datos</Text>
      <TextField
        label="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        autoCapitalize="words"
      />
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextField
        label="Teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        error={errors.phoneNumber}
        keyboardType="phone-pad"
      />

      <Button title="Continuar" onPress={handleContinue} />
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
  summaryLine: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  total: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
});

export default CheckoutScreen;
