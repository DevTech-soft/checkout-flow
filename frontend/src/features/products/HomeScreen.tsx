import { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import ProductCard from '@components/ProductCard';
import LoadingIndicator from '@components/LoadingIndicator';
import ErrorBanner from '@components/ErrorBanner';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import {
  fetchProducts,
  selectProducts,
  selectProductsError,
  selectProductsStatus,
} from '@redux/slices/products.slice';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const error = useAppSelector(selectProductsError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      navigation.navigate('ProductDetail', { productId });
    },
    [navigation],
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <ScreenContainer scrollable={false}>
        <LoadingIndicator label="Cargando productos..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <Text style={styles.title}>Productos</Text>
      {error ? <ErrorBanner message={error} /> : null}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleSelectProduct(item.id)}
          />
        )}
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
    gap: spacing.xs,
  },
});

export default HomeScreen;
