import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_SHORT = "30m";  // normal login
const ACCESS_TOKEN_EXPIRES_LONG = "30d"; // remember me

export function createAccessToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? ACCESS_TOKEN_EXPIRES_LONG : ACCESS_TOKEN_EXPIRES_SHORT;
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}