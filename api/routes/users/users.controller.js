const User = require("./users.model");

const getUsers = () => {
  return User.find({});
}

const createUser = (user, hashedPassword) => {
  return new User({
    ...user,
    password: hashedPassword
  }).save();
}

const checkUser = (username, email) => {
  return new Promise((resolve, reject) => {
    User.find().or([{ username }, { email }])
    .then(users => {
      resolve(users.length > 0);
    })
    .catch(error => {
      reject(error)
    })
  }) 
}

const getUser = (user) => {
  const { username, id } = user;

  if (username) return User.findOne({username});

  if (id) return User.findById(id);

  throw new Error("GetUser Function of the controller was called without specifying username or id.");

}


module.exports = {
  getUsers,
  createUser,
  checkUser,
  getUser
}