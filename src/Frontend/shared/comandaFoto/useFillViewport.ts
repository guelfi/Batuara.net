import { RefObject, useCallback, useLayoutEffect, useState } from 'react';

const bottomSpace = (el: HTMLElement): number => {
  let sum = 0;
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.documentElement) {
    const cs = window.getComputedStyle(node);
    sum += (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    node = node.parentElement;
  }
  return sum;
};

/**
 * Altura para o elemento ocupar exatamente o que sobra da área visível da tela (do topo dele até o fim),
 * sem criar rolagem na página. Usa a viewport visual (leva em conta as barras do navegador no celular) e
 * desconta o espaçamento inferior dos elementos que o contêm. Recalcula ao girar, redimensionar ou mudar o layout acima.
 */
export function useFillViewport(ref: RefObject<HTMLElement | null>, minHeight = 360): number | undefined {
  const [height, setHeight] = useState<number>();

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const visible = window.visualViewport?.height ?? window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const next = Math.max(minHeight, Math.floor(visible - top - bottomSpace(el)));
    setHeight((prev) => (prev !== undefined && Math.abs(prev - next) < 1 ? prev : next));
  }, [ref, minHeight]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);
    const parent = ref.current?.parentElement;
    const observer = typeof ResizeObserver !== 'undefined' && parent ? new ResizeObserver(measure) : null;
    if (observer && parent) observer.observe(parent);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure, ref]);

  return height;
}
