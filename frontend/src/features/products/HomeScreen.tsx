import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@components/ScreenContainer';
import ProductCard from '@components/ProductCard';
import LoadingIndicator from '@components/LoadingIndicator';
import ErrorBanner from '@components/ErrorBanner';
import { getProducts } from '@services/products/productService';
import type { Product } from '@services/products/product.types';
import { colors, spacing, typography } from '@theme';
import type { RootStackParamList } from '@navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getProducts()
      .then(result => {
        if (isMounted) {
          setProducts(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('No pudimos cargar los productos.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProduct = useCallback(
    (productId: string) => {
      navigation.navigate('ProductDetail', { productId });
    },
    [navigation],
  );

  if (loading) {
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
