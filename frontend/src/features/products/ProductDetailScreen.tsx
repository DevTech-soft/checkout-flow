import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import LoadingIndicator from '@components/LoadingIndicator';
import ErrorBanner from '@components/ErrorBanner';
import { useToast } from '@components/ToastProvider';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import {
  fetchProducts,
  selectProductById,
  selectProductsError,
  selectProductsStatus,
} from '@redux/slices/products.slice';
import { setOrder } from '@redux/slices/order.slice';
import { addItem } from '@redux/slices/cart.slice';
import { formatCurrency } from '@utils/currency';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const product = useAppSelector(selectProductById(productId));
  const status = useAppSelector(selectProductsStatus);
  const error = useAppSelector(selectProductsError);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  if (status === 'loading' || status === 'idle') {
    return (
      <ScreenContainer>
        <LoadingIndicator label="Cargando producto..." />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer>
        <ErrorBanner message={error ?? 'Producto no encontrado.'} />
      </ScreenContainer>
    );
  }

  const canIncrease = quantity < product.stock;
  const canDecrease = quantity > 1;

  const handleBuy = () => {
    dispatch(setOrder([{ productId: product.id, quantity }]));
    navigation.navigate('Checkout');
  };

  const handleAddToCart = () => {
    dispatch(addItem({ productId: product.id, quantity }));
    showToast('Agregado al carrito', 'success');
  };

  return (
    <ScreenContainer>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>
        {formatCurrency(product.priceInCents, product.currency)}
      </Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.stock}>{product.stock} disponibles</Text>

      <View style={styles.quantityRow}>
        <Button
          title="-"
          variant="secondary"
          onPress={() => setQuantity(current => current - 1)}
          disabled={!canDecrease}
        />
        <Text style={styles.quantityValue}>{quantity}</Text>
        <Button
          title="+"
          variant="secondary"
          onPress={() => setQuantity(current => current + 1)}
          disabled={!canIncrease}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Agregar al carrito"
          variant="secondary"
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        />
        <Button
          title="Comprar"
          onPress={handleBuy}
          disabled={product.stock === 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  price: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  stock: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quantityValue: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});

export default ProductDetailScreen;
