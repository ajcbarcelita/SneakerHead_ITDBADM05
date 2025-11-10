import { Model } from "objection";

export default class Province extends Model {
  static tableName = "ref_ph_provinces";
  static idColumn = "province_id";

  static jsonSchema = {
    type: "object",
    required: ["province_name"],
    properties: {
      province_id: { type: "integer" },
      province_name: { type: "string", maxLength: 50 },
    },
  };

  static relationMappings = {
    cities: {
      relation: Model.HasManyRelation,
      modelClass: () => import("./City_Municipality.js"),
      join: {
        from: "ref_ph_provinces.province_id",
        to: "ref_ph_cities_municipalities.province_id",
      },
    },
  };
}
