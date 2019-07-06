const _ = require("underscore");
const log = require("../../utils/logger");
const usuarios = require("../../database").usuarios;
const passportJWT = require("passport-jwt");

const jwtOptions = {
  secretOrKey: "es un secretoooo (8)",
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  let index = _.findIndex(usuarios, usuario => usuario.id === jwtPayload.id);

  if (index === -1) {
    log.info(
      `JWT token no es valido. Usuario con id ${
        jwtPayload.id
      } no pudo ser autenticado`
    );
    next(null, false);
  } else {
    log.info(
      `Usuario ${
        usuarios[index].username
      } suministró un token valido. Autenticación completada`
    );
    next(null, {
      username: usuarios[index].username,
      id: usuarios[index].id
    });
  }
});
