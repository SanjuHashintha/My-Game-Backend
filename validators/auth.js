import { check, validationResult } from "express-validator";

const validateSignupRequest = [
  check("username").notEmpty().withMessage("username is requird"),
  check("email").isEmail().withMessage("Email is not valid"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must have at least 6 characters"),
];

const validateSigninRequest = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("password").isLength({ min: 6 }).withMessage("Password is required"),
];

const isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

export { validateSignupRequest, validateSigninRequest, isRequestValidated };