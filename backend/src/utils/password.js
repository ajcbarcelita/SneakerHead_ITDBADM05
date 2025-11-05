const argon2 = require('argon2');
const joi = require('joi'); // a schema description language and data validator for JavaScript

// password schema to enforce strong passwords
const passwordSchema = joi.string()
    .min(8)
    .pattern(/[a-z]/, 'lowercase letter') // at least one lowercase letter
    .pattern(/[A-Z]/, 'uppercase letter') // at least one uppercase letter
    .pattern(/[0-9]/, 'number') // at least one digit
    .pattern(/[^a-zA-Z0-9]/, 'special character') // at least one special character
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.name': 'Password must contain at least one {#name}.',
        'any.required': 'Password is required.'
    });

// function to validate password against the schema BEFORE hashing
function validatePassword(pw) {
    const { error } = passwordSchema.validate(pw);
    if (error) {
        throw new Error(error.details[0].message);
    }
}

// Returns the hashed version of the provided password to be stored in the database during user registration
async function hashPassword(pw) {
    return await argon2.hash(pw, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB cost per hash
        timeCost: 5,         // 5 iterations
        parallelism: 1       // single thread
    });
}

// Used to verify password during user login
async function verifyPassword(hashedPw, plainPw) {
    try {
        return await argon2.verify(hashedPw, plainPw);
    } catch (err) {
        return false;
    }
}

module.exports = { hashPassword, verifyPassword, validatePassword };