const winston = require("winston");

/* 
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4, 
  silly: 5 
*/

module.exports = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "info",
      json: false,
      handleExceptions: true,
      maxsize: 5120000, // 5 MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD hh:mm" // Optional for choosing your own timestamp format.
        }),
        winston.format.printf(info => {
          const { timestamp, level, message, ...args } = info;
          return `${timestamp} - ${level}: ${message} ${
            Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
          }`;
        })
      ),
      filename: `${__dirname}/../logs/logs-de-aplicacion.log`
    }),
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
