
import { configureStore } from '@reduxjs/toolkit';
import testReducer from './slices/testSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    test: testReducer,
    language: languageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
