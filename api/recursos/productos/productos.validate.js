const Joi = require("joi");
const log = require("../../../utils/logger");

const blueprintProducto = Joi.object().keys({
  titulo: Joi.string()
    .max(100)
    .required(),
  precio: Joi.number()
    .positive()
    .precision(2)
    .required(),
  moneda: Joi.string()
    .length(3)
    .uppercase()
    .required()
});

module.exports = (req, res, next) => {
  let resultado = Joi.validate(req.body, blueprintProducto, {
    abortEarly: false,
    convert: false
  });

  if (resultado.error === null) {
    next();
  } else {
    let erroresDeValidacion = resultado.error.details.reduce(
      (acumulador, error) => {
        return acumulador + `[${error.message}] `;
      },
      ""
    );

    log.warn(
      `El siguiente producto no pasó la validacion: ${JSON.stringify(
        req.body
      )} ${erroresDeValidacion}`
    );

    res
      .status(400)
      .send(
        `El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${erroresDeValidacion}`
      );
  }
};
