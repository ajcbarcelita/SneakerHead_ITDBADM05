import { Model } from "objection";
import Address from "./Address.js";

export default class Branch extends Model {
  static tableName = "branches";
  static idColumn = "branch_id";

  static jsonSchema = {
    type: "object",
    required: ["branch_name"],
    properties: {
      branch_id: { type: "integer" },
      branch_name: { type: "string", maxLength: 100 },
      address_id: { type: ["integer", "null"] },
    },
  };

  static relationMappings = {
    address: {
      relation: Model.BelongsToOneRelation,
      modelClass: Address,
      join: {
        from: "branches.address_id",
        to: "addresses.address_id",
      },
    }
  };
}