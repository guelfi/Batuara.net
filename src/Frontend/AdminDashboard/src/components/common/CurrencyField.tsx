import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type CurrencyFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
  value: number;
  onValueChange: (value: number) => void;
};

const format = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Campo de valor em reais: digita-se só os numeros e o valor preenche da direita para a esquerda
// (digitar 1, 2, 5, 0 mostra R$ 0,01, R$ 0,12, R$ 1,25, R$ 12,50).
const CurrencyField: React.FC<CurrencyFieldProps> = ({ value, onValueChange, inputProps, ...rest }) => (
  <TextField
    {...rest}
    value={format(value)}
    onChange={(e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
      onValueChange(digits ? Number(digits) / 100 : 0);
    }}
    inputProps={{ inputMode: 'numeric', ...inputProps }}
  />
);

export default CurrencyField;
