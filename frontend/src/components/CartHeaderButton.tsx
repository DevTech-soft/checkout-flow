import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '@hooks/redux';
import { selectCartItemCount } from '@redux/slices/cart.slice';
import { colors, typography } from '@theme';

type CartHeaderButtonProps = {
  onPress: () => void;
};

function CartHeaderButton({ onPress }: CartHeaderButtonProps) {
  const itemCount = useAppSelector(selectCartItemCount);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Carrito de compras"
      onPress={onPress}
      style={styles.container}
    >
      <Text style={styles.icon}>🛒</Text>
      {itemCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.background,
    fontSize: typography.caption.fontSize - 2,
    fontWeight: '700',
  },
});

export default CartHeaderButton;
