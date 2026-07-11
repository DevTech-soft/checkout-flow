import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';
import type { CardBrand } from '@utils/cardBrand';

type CardPreviewProps = {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  brand: CardBrand;
};

const BRAND_LABEL: Record<CardBrand, string> = {
  VISA: 'VISA',
  MASTERCARD: 'Mastercard',
  UNKNOWN: '',
};

const BRAND_BACKGROUND: Record<CardBrand, string> = {
  VISA: '#4C1D95',
  MASTERCARD: '#C2410C',
  UNKNOWN: '#374151',
};

const PLACEHOLDER_NUMBER = '•••• •••• •••• ••••';
const PLACEHOLDER_HOLDER = 'NOMBRE APELLIDO';
const PLACEHOLDER_EXPIRY = 'MM/YY';

function CardPreview({
  cardNumber,
  cardHolder,
  expiryDate,
  brand,
}: CardPreviewProps) {
  const displayNumber = cardNumber.length > 0 ? cardNumber : PLACEHOLDER_NUMBER;
  const displayHolder =
    cardHolder.length > 0 ? cardHolder.toUpperCase() : PLACEHOLDER_HOLDER;
  const displayExpiry = expiryDate.length > 0 ? expiryDate : PLACEHOLDER_EXPIRY;

  return (
    <View
      style={[styles.card, { backgroundColor: BRAND_BACKGROUND[brand] }]}
      accessibilityRole="image"
      accessibilityLabel="Vista previa de la tarjeta"
    >
      <View style={styles.decorCircleLarge} />
      <View style={styles.decorCircleSmall} />

      <View style={styles.topRow}>
        <View style={styles.chip} />
        <Text style={styles.brandLogo}>{BRAND_LABEL[brand]}</Text>
      </View>

      <Text style={styles.number} numberOfLines={1} adjustsFontSizeToFit>
        {displayNumber}
      </Text>

      <View style={styles.bottomRow}>
        <View style={styles.bottomField}>
          <Text style={styles.smallLabel}>Titular</Text>
          <Text style={styles.holderText} numberOfLines={1}>
            {displayHolder}
          </Text>
        </View>
        <View style={styles.bottomField}>
          <Text style={styles.smallLabel}>Vence</Text>
          <Text style={styles.expiryText}>{displayExpiry}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    minHeight: 190,
    justifyContent: 'space-between',
  },
  decorCircleLarge: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircleSmall: {
    position: 'absolute',
    bottom: -20,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  brandLogo: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.background,
    fontStyle: 'italic',
  },
  number: {
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '600',
    color: colors.background,
    marginVertical: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomField: {
    maxWidth: '65%',
  },
  smallLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  holderText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.background,
  },
  expiryText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.background,
  },
});

export default CardPreview;
