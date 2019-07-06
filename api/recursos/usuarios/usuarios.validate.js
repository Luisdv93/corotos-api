const Joi = require("joi");
const log = require("../../../utils/logger");

const blueprintUsuario = Joi.object().keys({
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

let validarUsuario = (req, res, next) => {
  let resultado = Joi.validate(req.body, blueprintUsuario, {
    abortEarly: false,
    convert: false
  });

  if (resultado.error === null) {
    next();
  } else {
    log.info(
      "Producto falló la validación",
      resultado.error.details.map(error => error.message)
    );

    res
      .status(400)
      .send(
        "Información del usuario no cumple los requisitos. El nombre del usuario debe ser alfanumerico y tener 3 y 30 caracteres. La contraseña debe tener entre 6 y 200 caracteres. Asegurate de que el email sea valido."
      );
  }
};

const blueprintPedidoDeLogin = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

let validarPedidoDeLogin = (req, res, next) => {
  const resultado = Joi.validate(req.body, blueprintPedidoDeLogin, {
    convert: false,
    abortEarly: false
  });

  if (resultado.error === null) {
    next();
  } else {
    res
      .status(400)
      .send(
        "Login falló. Debes especificar el username y contraseña del usuario. Ambos deben ser string"
      );
  }
};

module.exports = {
  validarPedidoDeLogin,
  validarUsuario
};
