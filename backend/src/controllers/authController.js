import { ValidationError } from "objection";

import  User from "../models/User.js";
import { validateRegisterData } from "../services/validateRegister.js";
import { registerUserService } from "../services/registerUserService.js";
import { loginUserService } from "../services/loginUserService.js";
import { createAccessToken }from "../utils/jwt.js";
import { logEvent } from "../services/logEventService.js";


export const registerUser = async (req, res) => {
  try {
    const data = req.body;

    // validation service can return an object of field errors
    const errors = await validateRegisterData(data);
    if (errors && Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // service performs DB work and may throw errors
    const createdUser = await registerUserService(data);
    return res.status(201).json({ message: "User registered successfully", user: createdUser });
  } catch (error) {
    // concise server log
    console.error("registerUser error:", error?.message ?? String(error));

    // if service threw a structured error with statusCode use that
    if (error && typeof error.statusCode === "number") {
      const payload = { message: error.message ?? "Error" };
      if (error.details) payload.details = error.details;
      return res.status(error.statusCode).json(payload);
    }

    // map Objection model validation errors to 400 with details
    if (error instanceof ValidationError) {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.data ?? error.message });
    }

    // fallback: generic 500
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const result = await loginUserService({ email, password });

    const forwarded = req.get("x-forwarded-for");
    const ip = req.ip || (forwarded ? String(forwarded).split(",")[0].trim() : null);

    if (!result.success) {
      try {
        await logEvent({
          user_id: result.user?.user_id || null,
          role_id: result.user?.role_id || null,
          action: 'LOGIN_FAILED',
          description: `Failed login attempt for email: ${email}`,
          ip
        })
      } catch (logErr) {
        console.error("logEvent failed:", logErr?.message ?? logErr);
      }
      return res.status(401).json({ message: result.message });
    } 

    const user = result.user;
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role.role_name,
    };

    const accessToken = createAccessToken(payload, rememberMe);

    try {
      await logEvent({
      user_id: user.user_id,
      role_id: user.role_id,
      action: 'LOGIN_SUCCESS',
      description: `Successful login for email: ${email}`,
      ip
    })
    } catch (logErr) {
      console.error("logEvent failed:", logErr?.message ?? logErr);
    }

    return res.status(200).json({ accessToken, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};