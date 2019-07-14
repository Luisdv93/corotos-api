const passportJWT = require("passport-jwt");

const log = require("../../utils/logger");
const config = require("../../config");
const userController = require("../routes/users/users.controller");

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
  userController.getUser({id: jwtPayload.id })
  .then(user => {
    if (!user) {
      log.info(
        `The JWT is not valid. User with id [${
        jwtPayload.id
        }] doesn't exist.`
      );
      next(null, false);
      return;
    }

    log.info(
      `User [${
      user.username
      }] provided a valid JWT. Authentication completed.`
    );

    next(null, {
      username: user.username,
      id: user.id
    });
  }).catch(error => {
    log.error("An error occurred while validating a token", error);

    next(error);
  })

});
