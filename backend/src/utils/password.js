import argon2 from "argon2";
import joi from "joi";

const passwordSchema = joi
  .string()
  .min(8)
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(/[^a-zA-Z0-9]/, "special character")
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.name": "Password must contain at least one {#name}.",
    "any.required": "Password is required.",
  });

export function validatePassword(pw) {
  const { error } = passwordSchema.validate(pw);
  if (error) {
    throw new Error(error.details[0].message);
  }
}

export function comparePassword(pw1, pw2) {
  return pw1 === pw2;
}

export async function hashPassword(pw) {
  return await argon2.hash(pw, {
    type: argon2.argon2id,
    memoryCost: 64 * 1024,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hashedPw, plainPw) {
  try {
    return await argon2.verify(hashedPw, plainPw);
  } catch {
    return false;
  }
}
