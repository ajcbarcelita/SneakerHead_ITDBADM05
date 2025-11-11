import User from "../models/User.js";
import Address from "../models/Address.js";
import City_Municipality from "../models/City_Municipality.js";
import Province from "../models/Province.js";
import { hashPassword } from "../utils/password.js";
import { transaction } from "objection";

export async function registerUserService(data) {
  const {
    email,
    password,
    firstName,
    middleName,
    lastName,
    addressLine1,
    addressLine2,
    province,
    city, // frontend sends `city` and `province`
  } = data;

  const cityId = Number(city ?? data.city_id);
  const provId = Number(province ?? data.province_id);

  if (!cityId) {
    throw new Error("Missing or invalid city id");
  }

  if (!provId) {
    throw new Error("Missing or invalid province id");
  }

  // verify province & city exist and relate
  const prov = await Province.query().findById(provId);
  if (!prov) throw new Error(`Province ${provId} not found`);

  const c = await City_Municipality.query().findById(cityId);
  if (!c) throw new Error(`City/Municipality ${cityId} not found`);
  if (Number(c.province_id) !== provId) {
    throw new Error(`City ${cityId} does not belong to province ${provId}`);
  }

  const knex = User.knex();
  let trx; // start transaction
  try {
    trx = await transaction.start(knex);

    // insert address
    const address = await Address.query(trx).insertAndFetch({
      addressline1: addressLine1,
      addressline2: addressLine2 || null,
      city_id: cityId,
    });

    // hash pw
    const hashedPw = await hashPassword(password);

    // insert user (adjust column names to match your User model / table)
    const user = await User.query(trx).insertAndFetch({
      email,
      pw_hash: hashedPw,
      fname: firstName,
      mname: middleName || null,
      lname: lastName,
      address_id: address.address_id,
      role_id: 3,
    });

    await trx.commit();

    // remove sensitive fields before returning
    const safeUser = { ...user };
    delete safeUser.pw_hash;
    return safeUser;
  } catch (err) {
    if (trx) {
      try {
        await trx.rollback(); // rollback on error
      } catch (e) {
        console.error("Transaction rollback failed:", e);
      }
    }
    console.error("registerUserService error:", err.stack || err);
    throw err;
  }
}
