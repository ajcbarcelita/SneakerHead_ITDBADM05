import validator from "validator";

import User from "../models/User.js";
import City_Municipality from "../models/City_Municipality.js";
import Province from "../models/Province.js";

import { validatePassword, comparePassword } from "../utils/password.js";

// Check if email is valid and not already in use from DB
async function isEmailRegistered(email) {
  const existing = await User.query().findOne({ email });
  return !!existing; // converts the result to a boolean, since result is either null or an object
}

async function cityBelongsToProvince(cityID, provinceID) {
  const city = await City_Municipality.query().findById(cityID);
  return city && city.province_id === provinceID;
}

export async function validateRegisterData(data) {
  const errors = {};

  // Validate personal details
  if (!data.firstName?.trim()) errors.firstName = "First Name is required";
  if (!data.lastName?.trim()) errors.lastName = "Last Name is required";
  if (!data.email?.trim()) errors.email = "Email is required";
  else if (!validator.isEmail(data.email)) errors.email = "Invalid email format";
  else if (await isEmailRegistered(data.email)) errors.email = "Email already in use";

  // Validate password against criteria in utils/password.js
  try {
    validatePassword(data.password);
  } catch (err) {
    errors.password = err.message;
  }

  // Confirm password match
  if (!comparePassword(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Address details
  if (!data.addressLine1?.trim()) errors.addressLine1 = "Address Line 1 is required";
  // addressLine2 is optional
  if (!data.province) errors.province = "Province is required";
  if (!data.city) errors.city = "City is required";
  else if (data.province && !(await cityBelongsToProvince(data.city, data.province)))
    errors.city = "Selected city does not belong to the selected province";

  // enforce max lengths
  if (data.firstName && data.firstName.length > 100) errors.firstName = "First Name too long";
  if (data.lastName && data.lastName.length > 100) errors.lastName = "Last Name too long";
  if (data.middleName && data.middleName.length > 50) errors.middleName = "Middle Name too long";
  if (data.addressLine1 && data.addressLine1.length > 255)
    errors.addressLine1 = "Address Line 1 too long";
  if (data.addressLine2 && data.addressLine2.length > 255)
    errors.addressLine2 = "Address Line 2 too long";

  return errors;
}
