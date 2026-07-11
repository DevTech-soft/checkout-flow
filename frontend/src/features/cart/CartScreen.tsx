import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import Button from '@components/Button';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import {
  removeItem,
  selectCartLines,
  selectCartTotal,
  setItemQuantity,
} from '@redux/slices/cart.slice';
import type { CartLine } from '@redux/slices/cart.slice';
import { setOrder } from '@redux/slices/order.slice';
import { formatCurrency } from '@utils/currency';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

function CartScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const total = useAppSelector(selectCartTotal);

  const handleIncrease = (line: CartLine) => {
    if (line.quantity >= line.product.stock) {
      return;
    }
    dispatch(
      setItemQuantity({
        productId: line.product.id,
        quantity: line.quantity + 1,
      }),
    );
  };

  const handleDecrease = (line: CartLine) => {
    dispatch(
      setItemQuantity({
        productId: line.product.id,
        quantity: line.quantity - 1,
      }),
    );
  };

  const handleRemove = (line: CartLine) => {
    dispatch(removeItem(line.product.id));
  };

  const handleCheckout = () => {
    dispatch(
      setOrder(
        lines.map(line => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      ),
    );
    navigation.navigate('Checkout');
  };

  if (lines.length === 0) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <FlatList
        data={lines}
        keyExtractor={line => line.product.id}
        renderItem={({ item }) => (
          <View style={styles.line}>
            <Image
              source={{ uri: item.product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.product.name}
              </Text>
              <Text style={styles.price}>
                {formatCurrency(item.product.priceInCents, item.product.currency)}
              </Text>
              <View style={styles.quantityRow}>
                <Button
                  title="-"
                  variant="secondary"
                  onPress={() => handleDecrease(item)}
                />
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <Button
                  title="+"
                  variant="secondary"
                  onPress={() => handleIncrease(item)}
                  disabled={item.quantity >= item.product.stock}
                />
              </View>
              <Text style={styles.remove} onPress={() => handleRemove(item)}>
                Eliminar
              </Text>
            </View>
            <Text style={styles.lineTotal}>
              {formatCurrency(
                item.product.priceInCents * item.quantity,
                item.product.currency,
              )}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(total, lines[0]?.product.currency ?? 'COP')}
          </Text>
        </View>
        <Button title="Ir a pagar" onPress={handleCheckout} pill />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  line: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    marginTop: spacing.xs / 2,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quantityValue: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  remove: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    color: colors.error,
    fontWeight: '600',
  },
  lineTotal: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
});

export default CartScreen;
