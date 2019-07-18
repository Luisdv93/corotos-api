let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let request = require("supertest");

let config = require("../../../config");
let Product = require("./products.model");
let User = require("../users/users.model");
let app = require("../../../index").app;
let server = require("../../../index").server;

let productInDatabase = {
  title: "Macbook Pro 13 Inches",
  price: 1300,
  coin: "USD",
  owner: "daniel"
};

let newProduct = {
  title: "60 meters of rope",
  price: 200,
  coin: "USD"
};

let wrongID = "5ab8dbcc6539f91c2288b0c1";

let testUser = {
  username: "daniel",
  email: "daniel@gmail.com",
  password: "password123"
};

let authToken;

let invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk";

function obtainToken(done) {
  User.deleteMany({}, err => {
    if (err) done(err);

    request(app)
      .post("/users")
      .send(testUser)
      .end((_err, res) => {
        expect(res.status).toBe(201);

        request(app)
          .post("/users/login")
          .send({
            username: testUser.username,
            password: testUser.password
          })
          .end((_err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            done();
          });
      });
  });
}

describe("Products", () => {
  beforeEach(done => {
    Product.deleteMany({}, err => {
      done();
    });
  });

  afterAll(() => {
    server.close();
  });

  describe("GET /products/:id", () => {
    it("Trying to obtain a product with an invalid ID should return a status 400", done => {
      request(app)
        .get("/products/123")
        .end((_err, res) => {
          expect(res.status).toBe(400);
          expect(res.body.name).toBe("InvalidId");
          done();
        });
    });

    it("Trying to obtain a product that doesnt' exist should return a status 404", done => {
      request(app)
        .get(`/products/${wrongID}`)
        .end((_err, res) => {
          expect(res.status).toBe(404);
          expect(res.body.name).toBe("ProductDoesntExist");
          done();
        });
    });

    it("Should return a product if it exists.", done => {
      Product(productInDatabase)
        .save()
        .then(product => {
          request(app)
            .get(`/products/${product._id}`)
            .end((_err, res) => {
              expect(res.status).toBe(200);
              expect(res.body).toBeInstanceOf(Object);
              expect(res.body.title).toEqual(product.title);
              expect(res.body.price).toEqual(product.price);
              expect(res.body.coin).toEqual(product.coin);
              expect(res.body.owner).toEqual(product.owner);
              done();
            });
        })
        .catch(err => {
          done(err);
        });
    });
  });

  describe("POST /products", () => {
    beforeAll(obtainToken);

    it("If the user provides a valid auth token and product, the product should be created.", done => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newProduct)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(res.body.title).toEqual(newProduct.title);
          expect(res.body.coin).toEqual(newProduct.coin);
          expect(res.body.price).toEqual(newProduct.price);
          expect(res.body.owner).toEqual(testUser.username);
          done();
        });
    });

    it("If the user doesn't provide a valid auth token it should return 401", done => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send(newProduct)
        .end((_err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    it("If the product if missing the title it shouldn't be created.", done => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          coin: newProduct.coin,
          price: newProduct.price
        })
        .end((_err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it("If the product if missing the price it shouldn't be created.", done => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: newProduct.title,
          coin: newProduct.coin
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it("If the product if missing the coin it shouldn't be created.", done => {
      request(app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: newProduct.title,
          price: newProduct.price
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });
  });

  describe("DELETE /products/:id", () => {
    let realProductId;

    beforeAll(obtainToken);

    beforeEach(done => {
      Product.deleteMany({}, err => {
        if (err) done(err);
        Product(productInDatabase)
          .save()
          .then(product => {
            realProductId = product._id;
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

    it("Trying to delete a product with an invalid ID should return a status 400.", done => {
      request(app)
        .delete("/products/123")
        .set("Authorization", `Bearer ${authToken}`)
        .end((_err, res) => {
          expect(res.status).toBe(400);
          done();
        });
    });

    it("Trying to delete a product that doesn't exist should return a 404", done => {
      request(app)
        .delete(`/products/${wrongID}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((_err, res) => {
          expect(res.status).toBe(404);
          done();
        });
    });

    it("If the user doesn't provide a valid auth token it should return a 401.", done => {
      request(app)
        .delete(`/products/${realProductId}`)
        .set("Authorization", `Bearer ${invalidToken}`)
        .end((_err, res) => {
          expect(res.status).toBe(401);
          done();
        });
    });

    it("If the user is not the owner of the product it should return a 401.", done => {
      Product({
        title: "Adidas Gazelle",
        price: 90,
        coin: "USD",
        owner: "luis93"
      })
        .save()
        .then(product => {
          request(app)
            .delete(`/products/${product._id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .end((_err, res) => {
              expect(res.status).toBe(401);
              done();
            });
        })
        .catch(err => {
          done(err);
        });
    });

    it("If the user is the owner of the product and provides a valid token the product should deleted.", done => {
      request(app)
        .delete(`/products/${realProductId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((_err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.title).toEqual(productInDatabase.title);
          expect(res.body.price).toEqual(productInDatabase.price);
          expect(res.body.coin).toEqual(productInDatabase.coin);
          expect(res.body.owner).toEqual(productInDatabase.owner);

          Product.findById(realProductId)
            .then(product => {
              expect(product).toBeNull();
              done();
            })
            .catch(err => {
              done(err);
            });
        });
    });
  });
});
