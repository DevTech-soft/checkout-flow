import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '@features/splash/SplashScreen';
import HomeScreen from '@features/products/HomeScreen';
import ProductDetailScreen from '@features/products/ProductDetailScreen';
import CheckoutScreen from '@features/checkout/CheckoutScreen';
import CardFormScreen from '@features/checkout/CardFormScreen';
import PaymentSummaryScreen from '@features/checkout/PaymentSummaryScreen';
import TransactionResultScreen from '@features/checkout/TransactionResultScreen';
import type { RootStackParamList } from '@navigation/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Productos', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalle' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="CardForm"
        component={CardFormScreen}
        options={{ title: 'Tarjeta', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="PaymentSummary"
        component={PaymentSummaryScreen}
        options={{ title: 'Resumen', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="TransactionResult"
        component={TransactionResultScreen}
        options={{ title: 'Resultado', headerTitleAlign: 'center', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}

export default RootNavigator;
