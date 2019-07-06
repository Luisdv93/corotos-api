const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const passport = require("passport");
const validarProducto = require("./productos.validate");
const productos = require("../../../database").productos;
const log = require("../../../utils/logger");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const productosRouter = express.Router();

productosRouter.get("/", (req, res) => {
  res.json(productos);
});

productosRouter.post("/", [jwtAuthenticate, validarProducto], (req, res) => {
  let nuevoProducto = {
    ...req.body,
    id: uuidv4(),
    dueño: req.user.username
  };

  productos.push(nuevoProducto);

  log.info("Producto agregado a la colección productos", nuevoProducto);
  
  res.status(201).json(nuevoProducto);
});

productosRouter.get("/:id", (req, res) => {
  for (let producto of productos) {
    if (producto.id === req.params.id) {
      res.json(producto);
      return;
    }
  }
  res.status(404).send(`Èl producto con id ${req.params.id} no existe`);
});

productosRouter.put("/:id", [jwtAuthenticate, validarProducto], (req, res) => {
  let reemplazoParaProducto = {
    ...req.body,
    id: req.params.id,
    dueño: req.user.username
  };

  let indice = _.findIndex(productos, producto => producto.id === reemplazoParaProducto.id);

  if (indice !== -1) {
    if (productos[indice].dueño !== reemplazoParaProducto.dueño) {
      log.info(`Usuario ${req.user.username} no es dueño de producto con id ${reemplazoParaProducto.id}. Dueño real es ${productos[indice].dueño}. Request no será procesado.`);

      res.status(401).send(`No eres dueño del producto con id ${reemplazoParaProducto.id}. Solo puedes modificar productos creados por ti.`)

      return;
    }

    productos[indice] = reemplazoParaProducto;

    log.info(
      `Producto con id [${reemplazoParaProducto.id}] reemplazado con nuevo producto`,
      reemplazoParaProducto
    );

    res.status(200).json(reemplazoParaProducto);
    return;
  }

  res.status(404).send(`Èl producto con id ${reemplazoParaProducto.id} no existe`);
});

productosRouter.delete("/:id", jwtAuthenticate, (req, res) => {
  let indiceABorrar = _.findIndex(
    productos,
    producto => producto.id === req.params.id
  );

  if (indiceABorrar === -1) {
    log.warn(`Producto con id [${req.params.id}] no existe. Nada que borrar`);

    res
      .status(404)
      .send(`Producto con id [${req.params.id}] no existe. Nada que borrar.`);
    return;
  }

  if (productos[indiceABorrar].dueño !== req.user.username) {
    log.info(`Usuario ${req.user.username} no es dueño de producto con id ${productos[indiceABorrar].id}. Dueño real es ${productos[indiceABorrar].dueño}. Request no será procesado.`);

    res.status(401).send(`No eres dueño del producto con id ${productos[indiceABorrar].id}. Solo puedes borrar productos creados por ti.`)

    return;
  }

  log.info(`Producto con id [${req.params.id}] fue borrado`)

  let borrado = productos.splice(indiceABorrar, 1);

  res.json(borrado);
});

module.exports = productosRouter;
