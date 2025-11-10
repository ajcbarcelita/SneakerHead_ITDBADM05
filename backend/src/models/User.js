import { Model } from "objection";
import Role from "./Role.js";
import Address from "./Address.js";

export default class User extends Model {
  static tableName = "users";
  static idColumn = "user_id";

  static jsonSchema = {
    type: "object",
    required: ["email", "pw_hash", "lname", "fname", "role_id"],
    properties: {
      user_id: { type: "integer" },
      email: { type: "string", maxLength: 255 },
      pw_hash: { type: "string", maxLength: 255 },
      lname: { type: "string", maxLength: 100 },
      fname: { type: "string", maxLength: 100 },
      mname: { type: ["string", "null"], maxLength: 50 },
      address_id: { type: ["integer", "null"] },
      role_id: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      is_deleted: { type: "boolean", default: false },
    },
  };

  static relationMappings = {
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: Role,
      join: {
        from: "users.role_id",
        to: "ref_roles.role_id",
      },
    },
    address: {
      relation: Model.BelongsToOneRelation,
      modelClass: Address,
      join: {
        from: "users.address_id",
        to: "addresses.address_id",
      },
    },
  };
}
