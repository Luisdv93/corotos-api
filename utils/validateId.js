module.exports = (req, res, next) => {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`The id [${id}] provided in the URL is not valid.`);
    return;
  }

  next();
}