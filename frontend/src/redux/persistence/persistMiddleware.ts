import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { PERSISTED_SLICE_KEYS, savePersistedState } from './persistedState';
import type { PersistedSliceKey } from './persistedState';
import type { RootState } from '@redux/store';

function isPersistedAction(action: UnknownAction): boolean {
  const [sliceKey] = action.type.split('/');
  return PERSISTED_SLICE_KEYS.includes(sliceKey as PersistedSliceKey);
}

export const persistenceMiddleware: Middleware<{}, RootState> =
  storeApi => next => action => {
    const result = next(action);

    if (isPersistedAction(action as UnknownAction)) {
      savePersistedState(storeApi.getState()).catch(error => {
        console.warn('[persistence] Failed to persist state', error);
      });
    }

    return result;
  };
