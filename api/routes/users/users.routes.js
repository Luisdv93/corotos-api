const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const log = require("../../../utils/logger");
const validateUser = require("./users.validate").validateUser;
const bodyToLowercase = require("./bodyToLowercase");
const validateLogin = require("./users.validate").validateLogin;
const config = require("../../../config");
const processErrors = require("../../libs/errorHandlers").processErrors;
const { UserInfoInUse, InvalidCredentials } = require("./users.error");
const userController = require("./users.controller");

const usersRouter = express.Router();

usersRouter.get(
  "/",
  processErrors(async (_req, res) => {
    const users = await userController.getUsers();

    log.info("The users list was consulted", users);

    res.json(users);
  })
);

usersRouter.post(
  "/",
  [validateUser, bodyToLowercase],
  processErrors((req, res) => {
    let newUser = req.body;

    return userController
      .checkUser(newUser.username, newUser.email)
      .then(userExists => {
        if (userExists) {
          log.warn(
            `Email [${newUser.email}] or username [${
              newUser.username
            }] already exist in the database.`
          );

          throw new UserInfoInUse();
        }

        return bcrypt.hash(newUser.password, 10);
      })
      .then(hashedPassword => {
        return userController
          .createUser(newUser, hashedPassword)
          .then(newUser => {
            res.status(201).send(newUser);
          });
      });
  })
);

usersRouter.post(
  "/login",
  [validateLogin, bodyToLowercase],
  processErrors(async (req, res) => {
    let userRequest = req.body;
    let registeredUser;

    registeredUser = await userController.getUser({
      username: userRequest.username
    });

    if (!registeredUser) {
      log.info(
        `User [${userRequest.username}] doesn't exist. Authentication failed.`
      );

      throw new InvalidCredentials();
    }

    let correctPassword;

    correctPassword = await bcrypt.compare(
      userRequest.password,
      registeredUser.password
    );

    if (correctPassword) {
      let token = jwt.sign(
        {
          id: registeredUser.id
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expirationTime }
      );

      log.info(`User ${userRequest.username} completed the authentication.`);

      res.status(200).json({ ...registeredUser, token });
    } else {
      log.info(
        `User ${
          userRequest.username
        } failed the authentication. Incorrect password.`
      );

      throw new InvalidCredentials();
    }
  })
);

module.exports = usersRouter;
