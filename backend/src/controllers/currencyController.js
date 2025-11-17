import * as currencyService from '../services/currencyService.js';

// get all currencies
export const getAllCurrenciesHandler = async (req, res) => {
    try {
        const currencies = await currencyService.getAllCurrencies();
        res.json(currencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get all currencies with their exchange rates
export const getAllCurrenciesWithRatesHandler = async (req, res) => {
    try {
        const currencies = await currencyService.getAllCurrenciesWithRates();
        res.json(currencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}   

// get exchange rate for a specific currency
export const getExchangeRateHandler = async (req, res) => {
    try {
        const { currencyCode } = req.params;
        const exchangeRate = await currencyService.getExchangeRate(currencyCode);
        res.json(exchangeRate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// POST /api/convert-to-php
// body: { amount, fromCurrencyCode }
export const convertToPHPHandler = async (req, res) => {
  try {
    const { amount, fromCurrencyCode } = req.body;
    if (amount == null || !fromCurrencyCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const converted = await currencyService.convertToPHP(Number(amount), fromCurrencyCode);
    res.json({ converted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/convert-from-php
// body: { amount, toCurrencyCode }
export const convertFromPHPHandler = async (req, res) => {
  try {
    const { amount, toCurrencyCode } = req.body;
    if (amount == null || !toCurrencyCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const converted = await currencyService.convertFromPHP(Number(amount), toCurrencyCode);
    res.json({ converted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};