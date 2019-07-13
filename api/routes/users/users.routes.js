const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const log = require("../../../utils/logger");
const validateUser = require("./users.validate").validateUser;
const validateLogin = require("./users.validate")
  .validateLogin;
const users = require("../../../database").users;
const config = require("../../../config")

const usersRouter = express.Router();

usersRouter.get("/", (_req, res) => {
  res.json(users);
});

usersRouter.post("/", validateUser, (req, res) => {
  let newUser = req.body;

  let index = _.findIndex(users, user => {
    return (
      user.userName === newUser.userName ||
      user.email === newUser.email
    );
  });

  if (index !== -1) {
    log.info("Email or username already exist.");

    res
      .status(409)
      .send("The Email or the Username are already associated to an account.");

    return;
  }

  bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
    if (err) {
      log.error(
        "An error occurred while trying to obtain the hash of a password.",
        err
      );

      res.status(500).send("An error occurred processing the user creation.");

      return;
    }

    users.push({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword,
      id: uuidv4()
    });

    res.status(201).send("User created successfully.");
  });
});

usersRouter.post("/login", validateLogin, (req, res) => {
  let userRequest = req.body;

  let index = _.findIndex(
    users,
    user => user.username === userRequest.username
  );

  if (index === -1) {
    log.info(
      `User ${
        userRequest.username
      } doesn't exist. The authentication couldn't be perfomed.`
    );

    res.status(400).send("Invalid credentials. The user doesn't exist.");

    return;
  }

  let hashedPassword = users[index].password;

  bcrypt.compare(
    userRequest.password,
    hashedPassword,
    (_err, same) => {
      if (same) {
        let token = jwt.sign(
          {
            id: users[index].id
          },
          config.jwt.secret,
          { expiresIn: config.jwt.expirationTime }
        );

        log.info(
          `User ${userRequest.username} completed the authentication.`
        );

        res.status(200).json({ token });
      } else {
        log.info(
          `User ${
            userRequest.username
          } failed the authentication. Incorrect password.`
        );

        res
          .status(400)
          .send(
            "Invalid credentials. Make sure the username and the password are correct."
          );
      }
    }
  );
});

module.exports = usersRouter;
