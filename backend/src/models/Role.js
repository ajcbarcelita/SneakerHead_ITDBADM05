import { Model } from "objection";

export default class Role extends Model {
  static tableName = "ref_roles";
  static idColumn = "role_id";

  static jsonSchema = {
    type: "object",
    required: ["role_name"],
    properties: {
      role_id: { type: "integer" },
      role_name: { type: "string", maxLength: 45 },
    },
  };

  static relationMappings = {
    users: {
      relation: Model.HasManyRelation,
      modelClass: () => import("./User.js"),
      join: {
        from: "ref_roles.role_id",
        to: "users.role_id",
      },
    },
  };
}
