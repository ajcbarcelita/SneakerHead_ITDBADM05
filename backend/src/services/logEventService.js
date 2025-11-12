import db from "../db/db.js";

export async function logEvent({
  user_id = null,
  role_id = null,
  action,
  description = "",
  ip = null,
}) {
  return db.raw("CALL sp_log_event(?, ?, ?, ?, ?)", [user_id, role_id, action, description, ip]);
}
