import knex from 'knex';
import { Model } from 'objection';
import knexConfig from '../../knexfile.js';
import dotenv from 'dotenv';

dotenv.config();
const db = knex(knexConfig.development); // Change 'development' to 'production' as needed

// Binding Objection models to Knex instance
Model.knex(db);

export default db;