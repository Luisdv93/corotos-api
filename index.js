const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");

const logger = require("./utils/logger");
const authJWT = require("./api/libs/auth");
const config = require("./config");
const routes = require("./api/routes");

passport.use(authJWT);

mongoose.connect(`mongodb://127.0.0.1:27017/vendetuscorotos`)
mongoose.connection.on("error", () => {
  logger.error("The MongoDB connection has failed");
  process.exit(1);
})

const app = express();

app.use(bodyParser.json());

app.use(
  morgan("short", {
    stream: {
      write: message => logger.info(message.trim())
    }
  })
);

app.use(passport.initialize());

app.use(routes);

app.listen(config.port, () => {
  logger.info("Listening on port 3000");
});
