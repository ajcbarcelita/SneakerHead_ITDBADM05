const { Model } = require('objection');
const knex = require('../utils/db');

Model.knex(knex);

class BaseModel extends Model {
    // Common functionalities for all models can be added here
}

module.exports = BaseModel;