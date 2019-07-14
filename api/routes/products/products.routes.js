const express = require("express");
const passport = require("passport");
const validateProduct = require("./products.validate");
const log = require("../../../utils/logger");
const validateId = require("../../../utils/validateId");
const productController = require("./products.controller");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const productsRouter = express.Router();

productsRouter.get("/", jwtAuthenticate, (_req, res) => {
  productController.getProducts().then(products => {
    log.info("The products list was consulted", products);

    res.json(products);
  }).catch(err => {
    log.error("The products list couldn't be consulted", err);

    res.status(500).send("An error ocurred while trying to list the products from the database.");
  });
});

productsRouter.post("/", [jwtAuthenticate, validateProduct], (req, res) => {
  
  productController.createProduct(req.body, req.user.username).then(newProduct => {
    log.info("Product added to the products collection.", newProduct);

    res.status(201).json(newProduct);
  }).catch(err => {
    log.error("Product couldn't be created", err);
    
    res.status(500).send("An error ocurred while trying to create a product.");
  });
});

productsRouter.get("/:id", [jwtAuthenticate, validateId], (req, res) => {
  const id = req.params.id;

  productController.getProduct(id).then(product => {
    if (!product) {
      log.error("The product consulted doesn't exist.");

      res.status(404).send(`The product with id ${id} doesn't exist`);
      return;
    }
    
    log.info("A product was consulted.");

    res.json(product);
  }).catch(err => {
    log.error("An error ocurred while consulting the product.", err);

    res.status(500).send("An error ocurred while consulting the product.");
  });
});

productsRouter.put("/:id", [jwtAuthenticate, validateId, validateProduct], async  (req, res) => {
  let id = req.params.id;
  let user = req.user.username;
  let productToReplace;

  try {
    productToReplace = await productController.getProduct(id);
  } catch (error) {
    log.error(`An error occurred while trying to edit the product with id [${id}]`, error);

    res.status(500).send(`An error occurred while trying to edit the product with id [${id}]`);

    return;
  }

  if (!productToReplace) {
    log.info(`Product with id [${id}] doesn't exist. Nothing to edit.`);

    res
      .status(404)
      .send(`Product with id [${id}] doesn't exist. Nothing to edit.`);
    return;
  }

  if (productToReplace.owner !== user) {
    log.info(`User ${user} is not owner of the product with id ${id}.The real owner is ${productToReplace.owner}.The request won't be processed.`);

    res.status(401).send(`You are not the owner of the product with id ${id}.You can only edit products created by you.`)

    return;
  }

  let updatedProduct;

  try {
    updatedProduct = await productController.updatedProduct(id, productToReplace, user)

    log.info(`Product with id [${id}] was updated`, updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    log.error(`An error occurred while trying to update the product with id [${id}]`, error);

    res.status(500).send(`An error occurred while trying to update the product with id [${id}]`);
  }
});

productsRouter.delete("/:id", [jwtAuthenticate, validateId], async (req, res) => {
  const id = req.params.id;

  let productToDelete;

  try {
    productToDelete = await productController.getProduct(id);
  } catch (error) {
    log.error(`An error occurred while trying to delete the product with id [${id}]`, error);

    res.status(500).send(`An error occurred while trying to delete the product with id [${id}]`);

    return;
  }

  if (!productToDelete) {
    log.info(`Product with id [${id}] doesn't exist. Nothing to delete.`);

    res
      .status(404)
      .send(`Product with id [${id}] doesn't exist. Nothing to delete.`);
    return;
  }

  let user = req.user.username;

  if (productToDelete.owner !== user) {
    log.info(`User ${user} is not owner of the product with id ${id}.The real owner is ${productToDelete.owner}.The request won't be processed.`);

    res.status(401).send(`You are not the owner of the product with id ${id}.You can only delete products created by you.`)

    return;
  }

  try {
    let deletedProduct = await productController.deleteProduct(id);

    log.info(`Product with id [${id}] was deleted`);

    res.json(deletedProduct);
  } catch (error) {
    log.error(`An error occurred while trying to delete the product with id [${id}]`, error);

    res.status(500).send(`An error occurred while trying to delete the product with id [${id}]`);
  }
});

module.exports = productsRouter;
