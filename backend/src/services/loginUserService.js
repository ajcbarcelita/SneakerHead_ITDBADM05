import User from "../models/User.js";
import { verifyPassword } from "../utils/password.js";

export async function loginUserService({ email, password }) {
  // First, find user by their email
  const user = await User.query().findOne({ email, is_deleted: false }).withGraphFetched("[role]");
  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  // Next, verify the provided password against the stored hash
  const isPasswordValid = await verifyPassword(user.pw_hash, password);
  if (!isPasswordValid) {
    return { success: false, message: "Invalid email or password." };
  }

  // Exclude password hash from returned user data
  const { pw_hash, is_deleted, ...userData } = user;

  const payloadUser = {
    ...userData,
    role_name: user.role.role_name,
  };

  // Successful login
  return { success: true, user: payloadUser };
}
