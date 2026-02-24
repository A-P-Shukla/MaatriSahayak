import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pregnancyReducer from './slices/pregnancySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        pregnancy: pregnancyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
