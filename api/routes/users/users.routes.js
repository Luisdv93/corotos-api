const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const log = require("../../../utils/logger");
const validateUser = require("./users.validate").validateUser;
const bodyToLowercase = require("./bodyToLowercase")
const validateLogin = require("./users.validate")
  .validateLogin;
const config = require("../../../config");
const userController = require("./users.controller");

const usersRouter = express.Router();

usersRouter.get("/", async (_req, res) => {
  try {
    const users = await userController.getUsers();

    log.info("The users list was consulted", users);

    res.json(users);
  } catch (error) {
    log.error("The users list couldn't be consulted", err);

    res.status(500).send("An error ocurred while trying to list the users from the database.");
  }
});

usersRouter.post("/", [validateUser, bodyToLowercase], async (req, res) => {
  let newUser = req.body;

  let userExists;

  try {
    userExists = await userController.checkUser(newUser.username, newUser.email);
  } catch (error) {
    log.error(`An error ocurred while trying to verify if Email [${newUser.email}] or username [${newUser.username}] exist.`, err);

    res.status(500).send("An error ocurred while trying to create your account.");
  }

  if (userExists) {
    log.warn(`Email [${newUser.email}] or username [${newUser.username}] already exist in the database.`);

    res.status(409).send("The email or the username are already associated to another account.");

    return;
  }

  bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
    if (err) {
      log.error(
        "An error occurred while trying to obtain the hash of a password.",
        err
      );

      res.status(500).send("An error occurred while creating your account.");

      return;
    }

    try {
      const registeredUser = await userController.createUser(newUser, hashedPassword);

      res.status(201).send("User created successfully.", registeredUser);
    } catch (error) {
      log.error(
        "An error ocurred while trying to create a new user",
        err
      );

      res.status(500).send("An error ocurred while trying to create your account.");
    }
  });
});

usersRouter.post("/login", [validateLogin, bodyToLowercase], async (req, res) => {
  let userRequest = req.body;
  let registeredUser;

  try {
    registeredUser = await userController.getUser({
      username: userRequest.username
    })
  } catch (error) {
    log.error(`An error occurred while trying to check if the user [${userRequest.username}] already exist.`, error);

    res.status(500).send("An error occurred during the login process");
  }

  if (!registeredUser) {
    log.info(`User [${userRequest.username}] doesn't exist. Authentication failed.`);

    res.status(400).send("Invalid credentials. Make sure the username and email are correct.");

    return;
  }

  let correctPassword;

  try {
    correctPassword = await bcrypt.compare(userRequest.password, registeredUser.password);
  } catch (error) {
    log.error(`An occurred while trying to verify if the password is correct.`, error);

    res.status(500).send("An error occurred during the login process.");

    return;
  }

  if (correctPassword) {
    let token = jwt.sign(
      {
        id: registeredUser.id
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expirationTime }
    );

    log.info(
      `User ${userRequest.username} completed the authentication.`
    );

    res.status(200).json({ ...registeredUser, token });
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

});

module.exports = usersRouter;
