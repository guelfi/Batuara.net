// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Os testes de tela rodam em paralelo; com a máquina carregada a espera padrão de 1 s do Testing Library é curta para
// diálogos e carrosséis do MUI. 5 s evita falhas intermitentes sem esconder falhas reais (que continuam falhando).
configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);


if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => false,
    }) as any;
}
