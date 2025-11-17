import RefCurrency from "../models/RefCurrency.js";
import ExchangeRate from "../models/ExchangeRate.js";

// Does not include rates, just the list of currencies
export async function getAllCurrencies() {
    try {
        const currencies = await RefCurrency.query().orderBy("currency_code", "asc");
        return currencies;
    } catch (error) {
        throw new Error("Error fetching currencies: " + error.message);
    }
}

// Get all currencies with their exchange rates
export const getAllCurrenciesWithRates = async () => {
  try {
    const currencies = await RefCurrency.query()
      .withGraphFetched('exchangeRates')
      .orderBy('currency_code');
    
    return currencies;
  } catch (error) {
    throw new Error(`Failed to fetch currencies: ${error.message}`);
  }
};

// Get current exchange rate for a currency
export const getExchangeRate = async (currencyCode) => {
  try {
    const exchangeRate = await ExchangeRate.query()
      .findById(currencyCode);
    
    if (!exchangeRate) {
      throw new Error('Exchange rate not found');
    }
    
    return exchangeRate;
  } catch (error) {
    throw new Error(`Failed to fetch exchange rate: ${error.message}`);
  }
};

// Convert amount from one currency to PHP
export const convertToPHP = async (amount, fromCurrencyCode) => {
  try {
    if (fromCurrencyCode === 'PHP') {
      return amount;
    }
    
    const exchangeRate = await getExchangeRate(fromCurrencyCode);
    return amount * exchangeRate.rate_to_php;
  } catch (error) {
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
};

// Convert amount from PHP to another currency
export const convertFromPHP = async (amount, toCurrencyCode) => {
  try {
    if (toCurrencyCode === 'PHP') {
      return amount;
    }
    
    const exchangeRate = await getExchangeRate(toCurrencyCode);
    return amount / exchangeRate.rate_to_php;
  } catch (error) {
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
};