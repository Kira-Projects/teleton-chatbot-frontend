import appReducer, { setIsDarkModeReducer, StyleRtkState } from './appSlice.ts';
import {describe, expect, it} from "vitest";

describe('appSlice', () => {
    const initialState: StyleRtkState = {
        isDarkMode: false,
    };

    it('givenInitialState_whenReducerCalledWithUndefinedAction_thenReturnInitialState', () => {
        const state = appReducer(undefined, { type: "" });
        expect(state).toEqual(initialState);
    });

    it('givenInitialState_whenSetIsDarkModeReducerCalledWithTrue_thenSetDarkModeToTrue', () => {
        const darkModeState = appReducer(initialState, setIsDarkModeReducer(true));
        expect(darkModeState.isDarkMode).toBe(true);
    });

    it('givenInitialState_whenSetIsDarkModeReducerCalledWithFalse_thenSetDarkModeToFalse', () => {
        const lightModeState = appReducer(initialState, setIsDarkModeReducer(false));
        expect(lightModeState.isDarkMode).toBe(false);
    });
});
