import type { CardBrand } from '@utils/cardBrand';

export type CustomerInfo = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export type CardSummary = {
  brand: CardBrand;
  lastFourDigits: string;
  cardHolder: string;
  expiryDate: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Checkout: { productId: string; quantity: number };
  CardForm: { productId: string; quantity: number; customer: CustomerInfo };
  PaymentSummary: {
    productId: string;
    quantity: number;
    customer: CustomerInfo;
    card: CardSummary;
  };
  TransactionResult: { status: 'success' | 'error'; message?: string };
};
