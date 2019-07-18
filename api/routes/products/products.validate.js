const Joi = require("joi");
const log = require("../../../utils/logger");

const productSchema = Joi.object().keys({
  title: Joi.string()
    .max(100)
    .required(),
  price: Joi.number()
    .positive()
    .precision(2)
    .required(),
  coin: Joi.string()
    .length(3)
    .uppercase()
    .required()
});

module.exports = (req, res, next) => {
  let result = Joi.validate(req.body, productSchema, {
    abortEarly: false,
    convert: false
  });

  if (result.error === null) {
    next();
  } else {
    let validationErrors = result.error.details.reduce((acc, error) => {
      return acc + `[${error.message}] `;
    }, "");

    log.warn(
      `The following product didn't pass the validation: ${JSON.stringify(
        req.body
      )} ${validationErrors}`
    );

    res
      .status(400)
      .send(
        `The product must specify title, price and coin. Your errors: ${validationErrors}`
      );
  }
};
