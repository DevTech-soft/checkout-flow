import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme';
import { formatCurrency } from '@utils/currency';
import type { Product } from '@services/products/product.types';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {formatCurrency(product.priceInCents, product.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    margin: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  info: {
    padding: spacing.sm,
  },
  name: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    marginTop: spacing.xs,
    fontSize: typography.body.fontSize,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ProductCard;
