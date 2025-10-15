export const ShortenText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const PaymentTypes = [
    { label: 'Cartão', value: 'cartao' },
    { label: 'Pix', value: 'pix' },
    { label: 'Dinheiro', value: 'dinheiro' }
];

export const FixNumber = (value) => {
  return value.toFixed(2).replace('.', ',');
}

export const FormatCash = (value) => {
  if (value < 0) {
    return "-R$" + FixNumber(value * -1);
  }

  return "R$" + FixNumber(value);
}