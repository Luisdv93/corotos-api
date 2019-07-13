const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const passport = require("passport");
const validateProduct = require("./products.validate");
const products = require("../../../database").products;
const log = require("../../../utils/logger");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const productsRouter = express.Router();

productsRouter.get("/", (_req, res) => {
  res.json(products);
});

productsRouter.post("/", [jwtAuthenticate, validateProduct], (req, res) => {
  let newProduct = {
    ...req.body,
    id: uuidv4(),
    dueño: req.user.username
  };

  products.push(newProduct);

  log.info("Product added to the products collection.", newProduct);
  
  res.status(201).json(newProduct);
});

productsRouter.get("/:id", (req, res) => {
  for (let product of products) {
    if (product.id === req.params.id) {
      res.json(product);
      return;
    }
  }

  res.status(404).send(`The product with id ${req.params.id} doesn't exist`);
});

productsRouter.put("/:id", [jwtAuthenticate, validateProduct], (req, res) => {
  let newProduct = {
    ...req.body,
    id: req.params.id,
    owner: req.user.username
  };

  let index = _.findIndex(products, product => product.id === newProduct.id);

  if (index !== -1) {
    if (products[index].owner !== newProduct.owner) {
      log.info(`User ${req.user.username} is not owner of the product with ID ${newProduct.id}. The real owner is ${products[index].owner}. The request won't be processed.`);

      res.status(401).send(`You are not the owner of the product with ID ${newProduct.id}. You can only update products created by you.`)

      return;
    }

    products[index] = newProduct;

    log.info(
      `Product with ID [${newProduct.id}] was replaced with the new product.`,
      newProduct
    );

    res.status(200).json(newProduct);
    return;
  }

  res.status(404).send(`The product with ID ${newProduct.id} doesn't exist.`);
});

productsRouter.delete("/:id", jwtAuthenticate, (req, res) => {
  let indexToDelete = _.findIndex(
    products,
    product => product.id === req.params.id
  );

  if (indexToDelete === -1) {
    log.warn(`Product with ID [${req.params.id}] doesn't exist. Nothing to delete.`);

    res
      .status(404)
      .send(`Product with ID [${req.params.id}] doesn't exist. Nothing to delete.`);
    return;
  }

  if (products[indexToDelete].owner !== req.user.username) {
    log.info(`User ${req.user.username} is not owner of the product with ID ${products[indexToDelete].id}.The real owner is ${products[indexToDelete].owner}.The request won't be processed.`);

    res.status(401).send(`You are not the owner of the product with ID ${products[indexToDelete].id }.You can only delete products created by you.`)

    return;
  }

  log.info(`Product with ID [${req.params.id}] was deleted`)

  let deleted = products.splice(indexToDelete, 1);

  res.json(deleted);
});

module.exports = productsRouter;
