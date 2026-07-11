import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '@hooks/redux';
import { loadPersistedState } from '@redux/persistence/persistedState';
import { hydrateOrder } from '@redux/slices/order.slice';
import { hydrateCart } from '@redux/slices/cart.slice';
import { hydrateCheckout } from '@redux/slices/checkout.slice';
import { hydrateTransaction } from '@redux/slices/transaction.slice';
import { colors, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_MIN_DELAY_MS = 1200;

function SplashScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();

    const bootstrap = async () => {
      try {
        const persisted = await loadPersistedState();
        if (persisted) {
          dispatch(hydrateOrder(persisted.order));
          dispatch(hydrateCart(persisted.cart));
          dispatch(hydrateCheckout(persisted.checkout));
          dispatch(hydrateTransaction(persisted.transaction));
        }
      } catch (error) {
        console.warn('[splash] Failed to hydrate persisted state', error);
      }

      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(SPLASH_MIN_DELAY_MS - elapsed, 0);

      setTimeout(() => {
        if (isMounted) {
          navigation.replace('Home');
        }
      }, remainingDelay);
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [navigation, dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout Flow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    color: colors.background,
  },
});

export default SplashScreen;
