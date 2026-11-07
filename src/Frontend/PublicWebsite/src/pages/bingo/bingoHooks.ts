import { useEffect, useRef } from 'react';

export const POLL_INTERVAL_MS = 4000;

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Adiciona <meta name="robots" content="noindex"> enquanto a página está montada. */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const previousTitle = document.title;
    document.title = 'Bingo - Casa de Caridade Caboclo Batuara';
    return () => {
      document.head.removeChild(meta);
      document.title = previousTitle;
    };
  }, []);
}

/**
 * Executa `fn` imediatamente e depois a cada 4 s, pausando enquanto a aba está oculta
 * (e retomando com uma busca imediata ao voltar a ficar visível).
 */
export function usePolling(fn: () => void | Promise<void>, enabled = true, intervalMs = POLL_INTERVAL_MS) {
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    if (!enabled) return undefined;
    let timer: ReturnType<typeof setInterval> | null = null;

    const run = () => {
      void ref.current();
    };
    const start = () => {
      if (timer) return;
      timer = setInterval(run, intervalMs);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        run();
        start();
      }
    };

    run();
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs]);
}
