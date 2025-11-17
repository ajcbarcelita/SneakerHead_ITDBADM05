import { Model } from 'objection';

class RefCurrency extends Model {
  static get tableName() {
    return 'ref_currencies';
  }

  static get idColumn() {
    return 'currency_code';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['currency_code', 'currency_name'],
      properties: {
        currency_code: { type: 'string', maxLength: 3 },
        currency_name: { type: 'string', maxLength: 50 }
      }
    };
  }

  static get relationMappings() {
    const ExchangeRate = require('./ExchangeRate');

    return {
      exchangeRates: {
        relation: Model.HasManyRelation,
        modelClass: ExchangeRate,
        join: {
          from: 'ref_currencies.currency_code',
          to: 'exchange_rates.currency_code'
        }
      }
    };
  }
}

export default RefCurrency;