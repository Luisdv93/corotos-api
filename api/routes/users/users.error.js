class UserInfoInUse extends Error {
  constructor(msg) {
    super(msg);
    this.message =
      msg || "The email or username are already associated to an account.";
    this.status = 409;
    this.name = "UserInfoInUse";
  }
}

class InvalidCredentials extends Error {
  constructor(msg) {
    super(msg);
    this.message =
      msg ||
      "Invalid credentials. Make sure the username and password are correct.";
    this.status = 400;
    this.name = "InvalidCredentials";
  }
}

module.exports = {
  UserInfoInUse,
  InvalidCredentials
};
