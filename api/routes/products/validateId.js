const InvalidId = require("./products.error").InvalidId;

module.exports = (req, res, next) => {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    throw new InvalidId(`The id [${id}] provided in the URL is not valid.`);
  }

  next();
};
