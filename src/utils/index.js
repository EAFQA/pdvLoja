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