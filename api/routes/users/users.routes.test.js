let request = require("supertest");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let User = require("./users.model");
let app = require("../../../index").app;
let server = require("../../../index").server;
let config = require("../../../config");

let dummyUsers = [
  {
    username: "daniel",
    email: "daniel@gmail.com",
    password: "holaquetal"
  },
  {
    username: "ricardo",
    email: "ricardo@gmail.com",
    password: "quepaso"
  },
  {
    username: "diego",
    email: "diego@gmail.com",
    password: "nomedigas"
  }
];

function userExistAndAttsAreCorrect(user, done) {
  User.findOne({ username: user.username })
    .then(foundUser => {
      expect(foundUser).toBeInstanceOf(Object);
      expect(foundUser.username).toEqual(user.username);
      expect(foundUser.email).toEqual(user.email);

      let samePassword = bcrypt.compareSync(user.password, foundUser.password);
      expect(samePassword).toBeTruthy();
      done();
    })
    .catch(err => {
      done(err);
    });
}

async function userDoesntExist(user, done) {
  try {
    let users = await User.find().or([
      { username: user.username },
      { email: user.email }
    ]);

    expect(users).toHaveLength(0);
    done();
  } catch (err) {
    done(err);
  }
}

describe("Users", () => {
  beforeEach(done => {
    User.deleteMany({}, err => {
      done();
    });
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /users", () => {
    test("If there's no users it should return an empty array.", done => {
      request(app)
        .get("/users")
        .end((_err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test("If users exist it should return them in an array.", done => {
      Promise.all(dummyUsers.map(user => new User(user).save())).then(
        _users => {
          request(app)
            .get("/users")
            .end((_err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Array);
              expect(res.body).toHaveLength(3);
              done();
            });
        }
      );
    });
  });

  describe("POST /users", () => {
    test("An user that meets the conditions should be created.", done => {
      request(app)
        .post("/users")
        .send(dummyUsers[0])
        .end((_err, res) => {
          expect(res.status).toBe(201);
          expect(res.body).toBeInstanceOf(Object);
          userExistAndAttsAreCorrect(dummyUsers[0], done);
        });
    });

    test("Creating an user with an username that already exists should fail.", done => {
      Promise.all(dummyUsers.map(user => new User(user).save())).then(
        _users => {
          request(app)
            .post("/users")
            .send({
              username: dummyUsers[0].username,
              email: "danielnuevoemail@gmail.com",
              password: "cuidadoarriba"
            })
            .end((_err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe("string");
              done();
            });
        }
      );
    });

    test("Creating an user with an email that already exists should fail.", done => {
      Promise.all(dummyUsers.map(user => new User(user).save())).then(
        _users => {
          request(app)
            .post("/users")
            .send({
              username: "nuevodaniel",
              email: dummyUsers[0].email,
              password: "cuidadoarriba"
            })
            .end((_err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe("string");
              done();
            });
        }
      );
    });

    test("Creating an user without an username should fail.", done => {
      request(app)
        .post("/users")
        .send({
          email: "luis@gmail.com",
          password: "contraseña"
        })
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Creating an user without a password should fail.", done => {
      request(app)
        .post("/users")
        .send({
          username: "luis",
          email: "luis@gmail.com"
        })
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Creating an user without an email should fail.", done => {
      request(app)
        .post("/users")
        .send({
          username: "luis",
          password: "contraseña"
        })
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Creating an user with an invalid email should fail.", done => {
      let user = {
        username: "luis",
        email: "gmail.com",
        password: "contraseña"
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesntExist(user, done);
        });
    });

    test("Creating an user with an username with less than 3 chars should fail.", done => {
      let user = {
        username: "da",
        email: "daniel@gmail.com",
        password: "contraseña"
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesntExist(user, done);
        });
    });

    test("Creating an user with an username with more than 30 chars should fail.", done => {
      let user = {
        username: "daniel".repeat(10),
        email: "daniel@gmail.com",
        password: "contraseña"
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesntExist(user, done);
        });
    });

    test("Creating an user with a password with less than 6 chars should fail.", done => {
      let user = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "abc"
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesntExist(user, done);
        });
    });

    test("Creating an user with a password with more than 200 chars should fail.", done => {
      let user = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "contraseña".repeat(40)
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          userDoesntExist(user, done);
        });
    });

    test("The username and email of a valid user should be stored in lowercase.", done => {
      let user = {
        username: "DaNIEL",
        email: "DaNiel@GMAIL.com",
        password: "pruebapruebaprueba"
      };

      request(app)
        .post("/users")
        .send(user)
        .end((_err, res) => {
          expect(res.status).toBe(201);
          expect(res.body).toBeInstanceOf(Object);
          userExistAndAttsAreCorrect(
            {
              username: user.username.toLowerCase(),
              email: user.email.toLowerCase(),
              password: user.password
            },
            done
          );
        });
    });
  });

  describe("POST /login", () => {
    test("Login should fail if the user doesn't provide an username.", done => {
      let loginBody = {
        password: "holaholahola"
      };

      request(app)
        .post("/users/login")
        .send(loginBody)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login should fail if the user doesn't provide a password.", done => {
      let loginBody = {
        username: "username"
      };

      request(app)
        .post("/users/login")
        .send(loginBody)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login should fail if the user is not registered.", done => {
      let loginBody = {
        username: "jose",
        password: "holaholahola"
      };

      request(app)
        .post("/users/login")
        .send(loginBody)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login should fail for a registered user if he provides an incorrect password", done => {
      let user = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos"
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10)
      })
        .save()
        .then(newUser => {
          request(app)
            .post("/users/login")
            .send({
              username: user.username,
              password: "arrozverde"
            })
            .end((_err, res) => {
              expect(res.status).toBe(400);
              expect(typeof res.text).toBe("string");
              done();
            });
        })
        .catch(err => {
          done(err);
        });
    });

    test("A registered user should obtain a JWT after passing the login.", done => {
      let user = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos"
      };

      new User({
        username: user.username,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10)
      })
        .save()
        .then(newUser => {
          request(app)
            .post("/users/login")
            .send({
              username: user.username,
              password: user.password
            })
            .end((_err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.expirationTime
                })
              );
              done();
            });
        })
        .catch(err => {
          done(err);
        });
    });

    test("The capitalization shouldn't matter in the login", done => {
      let usuario = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos"
      };

      new User({
        username: usuario.username,
        email: usuario.email,
        password: bcrypt.hashSync(usuario.password, 10)
      })
        .save()
        .then(newUser => {
          request(app)
            .post("/users/login")
            .send({
              username: "DaNIEL",
              password: usuario.password
            })
            .end((_err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: newUser._id }, config.jwt.secret, {
                  expiresIn: config.jwt.expirationTime
                })
              );
              done();
            });
        })
        .catch(err => {
          done(err);
        });
    });
  });
});
