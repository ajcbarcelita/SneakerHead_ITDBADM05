import express from 'express';
import {
  convertToPHPHandler,
  convertFromPHPHandler,
  getAllCurrenciesHandler,
  getAllCurrenciesWithRatesHandler,
  getExchangeRateHandler
} from '../controllers/currencyController.js';

const router = express.Router();

// Get list of all currencies
router.get('/', getAllCurrenciesHandler);

// Get list of currencies with their exchange rates
router.get('/currencies-with-rates', getAllCurrenciesWithRatesHandler);

// Get exchange rate for a single currency
router.get('/exchange-rate/:currencyCode', getExchangeRateHandler);

// Convert from any currency to PHP
router.post('/convert-to-php', convertToPHPHandler);

// Convert from PHP to any currency
router.post('/convert-from-php', convertFromPHPHandler);

export default router;