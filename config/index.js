const enviroment = process.env.NODE_ENV || "development";

const baseConfig = {
  jwt: {},
  port: 3000 
}

let enviromentConfig = {};

switch (enviroment) {
  case "development":
  case "dev":
  case "desarrollo":
    enviromentConfig = require("./dev")
    break

  case "production":
  case "prod":
  case "produccion":
    enviromentConfig = require("./prod")
    break

  default:
    enviromentConfig = require("./dev")
}

console.log({...baseConfig,
  ...enviromentConfig})

module.exports = {
  ...baseConfig,
  ...enviromentConfig
}