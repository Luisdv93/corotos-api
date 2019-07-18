const express = require("express");
const passport = require("passport");
const validateProduct = require("./products.validate");
const log = require("../../../utils/logger");
const validateId = require("./validateId");
const productController = require("./products.controller");
const processErrors = require("../../libs/errorHandlers").processErrors;
const { ProductDoesntExist, InvalidOwner } = require("./products.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const productsRouter = express.Router();

productsRouter.get(
  "/",
  processErrors((_req, res) => {
    return productController.getProducts().then(products => {
      log.info("The products list was consulted", products);

      res.json(products);
    });
  })
);

productsRouter.post(
  "/",
  [jwtAuthenticate, validateProduct],
  processErrors((req, res) => {
    return productController
      .createProduct(req.body, req.user.username)
      .then(newProduct => {
        log.info("Product added to the products collection.", newProduct);

        res.status(201).json(newProduct);
      });
  })
);

productsRouter.get(
  "/:id",
  validateId,
  processErrors((req, res) => {
    const id = req.params.id;

    return productController.getProduct(id).then(product => {
      if (!product) {
        log.warn("The product consulted doesn't exist.");

        throw new ProductDoesntExist(
          `The product with id [${id}] doesn't exist`
        );
      }

      log.info("A product was consulted.", product);

      res.json(product);
    });
  })
);

productsRouter.put(
  "/:id",
  [jwtAuthenticate, validateId, validateProduct],
  processErrors(async (req, res) => {
    let id = req.params.id;
    let user = req.user.username;
    let productToReplace;

    productToReplace = await productController.getProduct(id);

    if (!productToReplace) {
      log.info(`Product with id [${id}] doesn't exist. Nothing to edit.`);

      throw new ProductDoesntExist(`The product with id [${id}] doesn't exist`);
    }

    if (productToReplace.owner !== user) {
      log.info(
        `User ${user} is not owner of the product with id ${id}.The real owner is ${
          productToReplace.owner
        }.The request won't be processed.`
      );

      throw new InvalidOwner(
        `You are not the owner of the product with id ${id}.You can only delete products created by you.`
      );
    }

    let updatedProduct;

    updatedProduct = await productController.updatedProduct(
      id,
      productToReplace,
      user
    );

    log.info(`Product with id [${id}] was updated`, updatedProduct);

    res.json(updatedProduct);
  })
);

productsRouter.delete(
  "/:id",
  [jwtAuthenticate, validateId],
  processErrors(async (req, res) => {
    const id = req.params.id;

    let productToDelete;

    productToDelete = await productController.getProduct(id);

    if (!productToDelete) {
      log.info(`Product with id [${id}] doesn't exist. Nothing to delete.`);

      throw new ProductDoesntExist(`The product with id [${id}] doesn't exist`);
    }

    let user = req.user.username;

    if (productToDelete.owner !== user) {
      log.info(
        `User ${user} is not owner of the product with id ${id}.The real owner is ${
          productToDelete.owner
        }.The request won't be processed.`
      );

      throw new InvalidOwner(
        `You are not the owner of the product with id ${id}.You can only delete products created by you.`
      );
    }

    let deletedProduct = await productController.deleteProduct(id);

    log.info(`Product with id [${id}] was deleted`);

    res.json(deletedProduct);
  })
);

module.exports = productsRouter;
