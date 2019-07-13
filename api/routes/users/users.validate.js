const Joi = require("joi");
const log = require("../../../utils/logger");

const userSchema = Joi.object().keys({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  password: Joi.string()
    .min(6)
    .max(200)
    .required(),
  email: Joi.string()
    .email()
    .required()
});

let validateUser = (req, res, next) => {
  let result = Joi.validate(req.body, userSchema, {
    abortEarly: false,
    convert: false
  });

  if (result.error === null) {
    next();
  } else {
    log.info(
      "The user failed the validation",
      result.error.details.map(error => error.message)
    );

    res
      .status(400)
      .send(
        "The user information doesn't meet the requirements. The name of the user must be alphanumeric and have between 3 and 30 characters. The password must have between 6 and 200 characters. Or make sure the email is valid."
      );
  }
};

const loginSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

let validateLogin = (req, res, next) => {
  const result = Joi.validate(req.body, loginSchema, {
    convert: false,
    abortEarly: false
  });

  if (result.error === null) {
    next();
  } else {
    res
      .status(400)
      .send(
        "Login failed. You must provide a username and a password"
      );
  }
};

module.exports = {
  validateUser: validateUser,
  validateLogin: validateLogin
};
