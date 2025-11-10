import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { Model } from "objection";

export default class Address extends Model {
  static tableName = "addresses";
  static idColumn = "address_id";

  static jsonSchema = {
    type: "object",
    required: ["addressline1", "city_id"],
    properties: {
      address_id: { type: "integer" },
      addressline1: { type: "string", maxLength: 255 },
      addressline2: { type: ["string", "null"], maxLength: 255 },
      city_id: { type: "integer" },
    },
  };

  static get relationMappings() {
    const City = require("./City_Municipality.js").default;
    const User = require("./User.js").default;

    return {
      city: {
        relation: Model.BelongsToOneRelation,
        modelClass: City,
        join: {
          from: "addresses.city_id",
          to: "ref_ph_cities_municipalities.city_id",
        },
      },
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: "addresses.address_id",
          to: "users.address_id",
        },
      },
    };
  }
}
