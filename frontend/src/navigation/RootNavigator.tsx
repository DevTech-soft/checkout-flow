import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceholderScreen from '@components/PlaceholderScreen';
import type { RootStackParamList } from '@navigation/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash">
        {() => <PlaceholderScreen label="Splash" />}
      </Stack.Screen>
      <Stack.Screen name="Home">
        {() => <PlaceholderScreen label="Home" />}
      </Stack.Screen>
      <Stack.Screen name="ProductDetail">
        {() => <PlaceholderScreen label="ProductDetail" />}
      </Stack.Screen>
      <Stack.Screen name="Checkout">
        {() => <PlaceholderScreen label="Checkout" />}
      </Stack.Screen>
      <Stack.Screen name="CardForm">
        {() => <PlaceholderScreen label="CardForm" />}
      </Stack.Screen>
      <Stack.Screen name="PaymentSummary">
        {() => <PlaceholderScreen label="PaymentSummary" />}
      </Stack.Screen>
      <Stack.Screen name="TransactionResult">
        {() => <PlaceholderScreen label="TransactionResult" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default RootNavigator;
