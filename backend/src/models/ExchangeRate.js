import { Model } from 'objection';
import RefCurrency from './RefCurrency.js';

class ExchangeRate extends Model {
  static get tableName() {
    return 'exchange_rates';
  }

  static get idColumn() {
    return 'currency_code';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['currency_code', 'rate_to_php'],
      properties: {
        currency_code: { type: 'string', maxLength: 3 },
        rate_to_php: { type: 'number' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  $beforeInsert() {
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    return {
      currency: {
        relation: Model.BelongsToOneRelation,
        modelClass: RefCurrency,
        join: {
          from: 'exchange_rates.currency_code',
          to: 'ref_currencies.currency_code'
        }
      }
    };
  }
}

export default ExchangeRate;