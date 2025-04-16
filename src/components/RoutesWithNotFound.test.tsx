import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import RoutesWithNotFound from './RoutesWithNotFound';
import { describe, it, expect, beforeEach } from 'vitest';

// Función auxiliar para renderizar el componente con diferentes rutas
const renderWithRouter = (initialEntries: string[], children: React.ReactNode) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <RoutesWithNotFound>{children}</RoutesWithNotFound>
        </MemoryRouter>
    );
};

describe('RoutesWithNotFound', () => {
    // Asegura limpiar el DOM antes de cada test para evitar interferencias
    beforeEach(() => {
        cleanup();
    });

    it('givenUnknownRoute_whenRender_thenDisplayNotFoundMessage', () => {
        const TempComponent = () => <h1>Temp Component</h1>;

        renderWithRouter(['/unknown'], <Route path="/" element={<TempComponent />} />);

        expect(screen.getByText('Not Found')).toBeDefined();
    });

    it('givenValidRoute_whenRender_thenDisplayChildComponent', () => {
        const ExampleComponent = () => <div>Example Component</div>;

        renderWithRouter(['/'], <Route path="/" element={<ExampleComponent />} />);

        expect(screen.getByText('Example Component')).toBeDefined();
    });

    it('givenValidRoute_thenChangeToUnknownRoute_whenRender_thenDisplayNotFoundMessage', () => {
        const ChildComponent = () => <div>Child Component</div>;

        renderWithRouter(['/'], <Route path="/" element={<ChildComponent />} />);

        expect(screen.getByText('Child Component')).toBeDefined();

        renderWithRouter(['/unknown'], <Route path="/" element={<ChildComponent />} />);

        expect(screen.getByText('Not Found')).toBeDefined();
    });
});
