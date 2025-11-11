import { Model } from "objection";
import User from "./User.js";
import Role from "./Role.js";

export default class UserLog extends Model {
  static tableName = "user_logs";
  static idColumn = "log_id";

  static jsonSchema = {
    type: "object",
    required: ["log_id", "user_id", "role_id", "action", "description"],
    properties: {
      log_id: { type: "integer" },
      user_id: { type: "integer" },
      role_id: { type: "integer" },
      action: { type: "string", maxLength: 50 },
      description: { type: "string", maxLength: 255 },
      ip_address: { type: ["string", "null"], maxLength: 45 },
      created_at: { type: "string", format: "date-time" },
    },
  };

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: "user_logs.user_id",
        to: "users.user_id",
      },
    },
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: Role,
      join: {
        from: "user_logs.role_id",
        to: "ref_roles.role_id",
      },
    },
  };
}
