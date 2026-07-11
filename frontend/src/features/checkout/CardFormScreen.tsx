import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import TextField from '@components/TextField';
import CardPreview from '@components/CardPreview';
import ErrorBanner from '@components/ErrorBanner';
import { useAppDispatch } from '@hooks/redux';
import { useToast } from '@components/ToastProvider';
import { setCard } from '@redux/slices/card.slice';
import { tokenizeCard } from '@services/gateway/wompiClient';
import { detectCardBrand } from '@utils/cardBrand';
import { formatCardNumber, formatExpiryDate } from '@utils/cardFormat';
import {
  validateCardNumber,
  validateCvv,
  validateExpiryDate,
  validateFullName,
} from '@utils/validators';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'CardForm'>;

type FormErrors = Partial<
  Record<'cardHolder' | 'cardNumber' | 'expiryDate' | 'cvv', string>
>;

function CardFormScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [tokenizing, setTokenizing] = useState(false);
  const [tokenizeError, setTokenizeError] = useState<string | null>(null);

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

  const handleContinue = async () => {
    const nextErrors: FormErrors = {
      cardHolder: validateFullName(cardHolder) ?? undefined,
      cardNumber: validateCardNumber(cardNumber) ?? undefined,
      expiryDate: validateExpiryDate(expiryDate) ?? undefined,
      cvv: validateCvv(cvv) ?? undefined,
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setTokenizeError(null);
    setTokenizing(true);

    try {
      const token = await tokenizeCard({
        cardNumber,
        cvv,
        expiryDate,
        cardHolder,
      });

      const digits = cardNumber.replace(/\s/g, '');

      dispatch(
        setCard({
          brand,
          lastFourDigits: digits.slice(-4),
          cardHolder,
          expiryDate,
          token,
        }),
      );
      navigation.navigate('PaymentSummary');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos validar tu tarjeta. Intenta nuevamente.';
      setTokenizeError(message);
      showToast(message);
    } finally {
      setTokenizing(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Datos de la tarjeta</Text>

      <CardPreview
        cardNumber={cardNumber}
        cardHolder={cardHolder}
        expiryDate={expiryDate}
        brand={brand}
      />

      <TextField
        label="Nombre en la tarjeta"
        value={cardHolder}
        onChangeText={setCardHolder}
        error={errors.cardHolder}
        autoCapitalize="words"
      />

      <TextField
        label="Número de tarjeta"
        value={cardNumber}
        onChangeText={value => setCardNumber(formatCardNumber(value))}
        error={errors.cardNumber}
        keyboardType="number-pad"
        maxLength={23}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <TextField
            label="Vencimiento (MM/YY)"
            value={expiryDate}
            onChangeText={value => setExpiryDate(formatExpiryDate(value))}
            error={errors.expiryDate}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
        <View style={styles.half}>
          <TextField
            label="CVV"
            value={cvv}
            onChangeText={setCvv}
            error={errors.cvv}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      {tokenizeError ? <ErrorBanner message={tokenizeError} /> : null}

      <Button
        title="Continuar"
        onPress={handleContinue}
        loading={tokenizing}
        disabled={tokenizing}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
});

export default CardFormScreen;
