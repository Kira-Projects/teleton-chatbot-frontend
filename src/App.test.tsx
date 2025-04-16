import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from './store/store';
import {describe, expect, it, vi} from "vitest";
import App from './App';


vi.mock('./config', () => ({
    config: {
        REST_API: 'https://api.mock.com',
        PUBLIC_KEY: 'mock_public_key',
    },
}));

describe('App', () => {
    it('givenAppComponent_whenRenderAppAndNavigateToTheRootPath_thenDisplayLoginPage', () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );

        expect(screen.getByText('Login Page')).toBeDefined();
    });
});
