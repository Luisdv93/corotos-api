const enviroment = process.env.NODE_ENV || "development";

const baseConfig = {
  jwt: {},
  port: 3000,
  disableLogs: false
};

let enviromentConfig = {};

switch (enviroment) {
  case "dev":
    enviromentConfig = require("./dev");
    break;

  case "prod":
    enviromentConfig = require("./prod");
    break;

  case "test":
    enviromentConfig = require("./test");
    break;

  default:
    enviromentConfig = require("./dev");
}

module.exports = {
  ...baseConfig,
  ...enviromentConfig
};
