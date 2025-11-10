import { ValidationError } from "objection";
import { validateRegisterData } from "../services/validateRegister.js";
import { registerUserService } from "../services/registerUserService.js";

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
  res.status(501).json({ message: "Not implemented" });
};
