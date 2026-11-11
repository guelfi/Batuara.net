import React, { useState } from 'react';
import { resolveBaseUrl } from '../../services/api';
import ComandaFotoCore from '../../_shared/comandaFoto/ComandaFotoCore';

const TOKEN_KEY = 'comanda_foto_token';

/**
 * Token do link do evento. Vem no fragmento (#t=...), que o navegador nunca envia ao servidor
 * (não cai em log do nginx nem em Referer). Aceita ?t= só para links antigos.
 * Fica apenas em sessionStorage (some ao fechar a aba) e é apagado da barra de endereço.
 */
const readToken = (): string => {
  const url = new URL(window.location.href);
  const fromHash = new URLSearchParams(url.hash.replace(/^#/, '')).get('t');
  const fromQuery = url.searchParams.get('t');
  const fromUrl = fromHash || fromQuery;

  try {
    // versões anteriores guardavam o token em localStorage: remove
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignora */
  }

  if (fromUrl) {
    try {
      window.sessionStorage.setItem(TOKEN_KEY, fromUrl);
    } catch {
      /* sem storage: o token vale só nesta carga da página */
    }
    url.searchParams.delete('t');
    url.hash = '';
    window.history.replaceState(null, '', url.pathname + url.search);
    return fromUrl;
  }

  try {
    return window.sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const ComandaFotoPage: React.FC = () => {
  const [token] = useState(readToken);
  return <ComandaFotoCore token={token} baseUrl={resolveBaseUrl()} variant="page" />;
};

export default ComandaFotoPage;
