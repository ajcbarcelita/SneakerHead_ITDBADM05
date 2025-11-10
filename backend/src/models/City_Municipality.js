import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { Model } from "objection";

export default class City_Municipality extends Model {
  static tableName = "ref_ph_cities_municipalities";
  static idColumn = "city_id";

  static jsonSchema = {
    type: "object",
    required: ["city_name", "province_id"],
    properties: {
      city_id: { type: "integer" },
      city_name: { type: "string", maxLength: 100 },
      province_id: { type: "integer" },
    },
  };

  // lazy relationMappings to avoid circular import issues
  static get relationMappings() {
    const Province = require("./Province.js").default;
    const Address = require("./Address.js").default;

    return {
      province: {
        relation: Model.BelongsToOneRelation,
        modelClass: Province,
        join: {
          from: "ref_ph_cities_municipalities.province_id",
          to: "ref_ph_provinces.province_id",
        },
      },
      addresses: {
        relation: Model.HasManyRelation,
        modelClass: Address,
        join: {
          from: "ref_ph_cities_municipalities.city_id",
          to: "addresses.city_id",
        },
      },
    };
  }
}
