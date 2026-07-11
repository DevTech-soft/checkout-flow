import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { ToastProvider } from '@components/ToastProvider';
import { createAppStore } from '@redux/store';
import type { RootState } from '@redux/store';

interface RenderOptions {
  preloadedState?: Partial<RootState>;
}

export async function renderWithProviders(
  ui: ReactElement,
  { preloadedState }: RenderOptions = {},
) {
  const store = createAppStore(preloadedState);

  return {
    store,
    ...(await render(
      <Provider store={store}>
        <ToastProvider>{ui}</ToastProvider>
      </Provider>,
    )),
  };
}
