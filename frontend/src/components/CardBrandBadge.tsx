import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';
import type { CardBrand } from '@utils/cardBrand';

type CardBrandBadgeProps = {
  brand: CardBrand;
};

const LABELS: Record<CardBrand, string> = {
  VISA: 'VISA',
  MASTERCARD: 'Mastercard',
  UNKNOWN: '',
};

function CardBrandBadge({ brand }: CardBrandBadgeProps) {
  if (brand === 'UNKNOWN') {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{LABELS[brand]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
});

export default CardBrandBadge;
