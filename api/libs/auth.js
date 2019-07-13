const _ = require("underscore");
const passportJWT = require("passport-jwt");

const log = require("../../utils/logger");
const users = require("../../database").users;
const config = require("../../config")

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  let index = _.findIndex(users, usuario => usuario.id === jwtPayload.id);

  if (index === -1) {
    log.info(
      `The JWT is not valid. User with ID ${
        jwtPayload.id
      } couldn't be authenticated.`
    );
    next(null, false);
  } else {
    log.info(
      `User ${
        users[index].username
      } provided a valid JWT. Authentication completed.`
    );
    next(null, {
      username: users[index].username,
      id: users[index].id
    });
  }
});
