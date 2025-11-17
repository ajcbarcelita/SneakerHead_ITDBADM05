import api from './api';

export const getCurrencies = async () => {
  const res = await api.get('/currencies');
  return res.data;
};

export const getCurrenciesWithRates = async () => {
  const res = await api.get('/currencies/currencies-with-rates');
  return res.data;
};

export const convertToPHP = async (amount, fromCurrencyCode) => {
  const res = await api.post('/currencies/convert-to-php', { amount, fromCurrencyCode });
  return res.data.converted;
};

export const convertFromPHP = async (amount, toCurrencyCode) => {
  const res = await api.post('/currencies/convert-from-php', { amount, toCurrencyCode });
  return res.data.converted;
};
