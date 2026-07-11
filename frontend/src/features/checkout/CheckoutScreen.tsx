import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import TextField from '@components/TextField';
import ErrorBanner from '@components/ErrorBanner';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { selectOrderLines, selectOrderTotal } from '@redux/slices/order.slice';
import { setCustomer } from '@redux/slices/checkout.slice';
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

function CheckoutScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectOrderLines);
  const total = useAppSelector(selectOrderTotal);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

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

    dispatch(setCustomer({ fullName, email, phoneNumber }));
    navigation.navigate('CardForm');
  };

  if (lines.length === 0) {
    return (
      <ScreenContainer>
        <ErrorBanner message="No hay una orden activa. Vuelve a seleccionar un producto." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Resumen de compra</Text>
      {lines.map(line => (
        <Text key={line.product.id} style={styles.summaryLine}>
          {line.product.name} x{line.quantity}
        </Text>
      ))}
      <Text style={styles.total}>
        {formatCurrency(total, lines[0].product.currency)}
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
