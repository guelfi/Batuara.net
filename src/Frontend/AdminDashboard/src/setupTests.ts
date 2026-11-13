import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Os testes de tela rodam em paralelo; com a máquina carregada a espera padrão de 1 s do Testing Library é curta para
// diálogos e carrosséis do MUI. 5 s evita falhas intermitentes sem esconder falhas reais (que continuam falhando).
configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);


class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || ResizeObserverMock;

(window as any).matchMedia =
  (window as any).matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

// o Jest do react-scripts 5 nao traz TextEncoder (usado pelo x-data-grid)
import { TextDecoder, TextEncoder } from 'util';
(globalThis as any).TextEncoder = (globalThis as any).TextEncoder || TextEncoder;
(globalThis as any).TextDecoder = (globalThis as any).TextDecoder || TextDecoder;
