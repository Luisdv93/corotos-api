class ProductDoesntExist extends Error {
  constructor(msg) {
    super(msg);
    this.message =
      msg || "The product doesn't exist. The operation couldn't be completed.";
    this.status = 404;
    this.name = "ProductDoesntExist";
  }
}

class InvalidOwner extends Error {
  constructor(msg) {
    super(msg);
    this.message =
      msg ||
      "You are not the owner of this product. The operation couldn't be completed.";
    this.status = 401;
    this.name = "InvalidOwner";
  }
}

class InvalidId extends Error {
  constructor(msg) {
    super(msg);
    this.message = msg || "The id provided in the URL is not valid.";
    this.status = 400;
    this.name = "InvalidId";
  }
}

module.exports = {
  ProductDoesntExist,
  InvalidOwner,
  InvalidId
};
