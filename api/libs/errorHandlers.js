const log = require("../../utils/logger");
const mongoose = require("mongoose");

exports.processErrors = fn => {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
};

exports.processDbErrors = (err, req, res, next) => {
  if (err instanceof mongoose.Error || err.name === "MongoError") {
    log.error("An error related to mongoose occurred", err);

    err.message = "Error related to the database occurred.";
    err.status = 500;
  }

  next(err);
};

exports.prodErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    name: err.name,
    message: err.message
  });
};

exports.devErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    name: err.name,
    message: err.message,
    stack: err.stack || ""
  });
};
