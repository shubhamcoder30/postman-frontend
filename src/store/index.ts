import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import environmentReducer from './slices/environmentSlice';

export const store = configureStore({
    reducer: {
        collections: collectionReducer,
        environments: environmentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
