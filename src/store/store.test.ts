import store, { RootState, AppDispatch } from './store';
import {describe, expect, it} from "vitest";

describe('givenReduxStore_whenAccessStore_thenCheckTypes', () => {
    it('should have correct types for RootState and AppDispatch', () => {
        // Verificar que el tipo de RootState sea el tipo esperado
        const state: RootState = store.getState();
        expect(state).toBeDefined(); // Solo verificamos que no sea indefinido

        // Verificar que el tipo de AppDispatch sea el tipo esperado
        const dispatch: AppDispatch = store.dispatch;
        expect(dispatch).toBeDefined(); // Solo verificamos que no sea indefinido
    });
});
