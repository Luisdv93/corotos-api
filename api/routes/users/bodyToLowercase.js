module.exports = (req, _res, next) => {
  req.body.username && (req.body.username = req.body.username.toLowerCase());

  req.body.email && (req.body.email = req.body.email.toLowerCase());

  next();
}