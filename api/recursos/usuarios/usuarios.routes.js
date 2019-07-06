const express = require("express");
const _ = require("underscore");
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const log = require("../../../utils/logger");
const validarUsuario = require("./usuarios.validate").validarUsuario;
const validarPedidoDeLogin = require("./usuarios.validate")
  .validarPedidoDeLogin;
const usuarios = require("../../../database").usuarios;

const usuariosRouter = express.Router();

usuariosRouter.get("/", (_req, res) => {
  res.json(usuarios);
});

usuariosRouter.post("/", validarUsuario, (req, res) => {
  let nuevoUsuario = req.body;

  let indice = _.findIndex(usuarios, usuario => {
    return (
      usuario.userName === nuevoUsuario.userName ||
      usuario.email === nuevoUsuario.email
    );
  });

  if (indice !== -1) {
    log.info("Email o username ya existen en la base de datos");

    res
      .status(409)
      .send("El email o username ya están asociados a una cuenta.");
    return;
  }

  bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
    if (err) {
      log.error(
        "Error ocurrió al tratar de obtener el hash de una contraseña",
        err
      );
      res.status(500).send("Ocurrió un error procesando creación del usuario");
      return;
    }

    usuarios.push({
      username: nuevoUsuario.username,
      email: nuevoUsuario.email,
      password: hashedPassword,
      id: uuidv4()
    });

    res.status(201).send("Usuario creado exitosamente");
  });
});

usuariosRouter.post("/login", validarPedidoDeLogin, (req, res) => {
  let usuarioNoAutenticado = req.body;

  let index = _.findIndex(
    usuarios,
    usuario => usuario.username === usuarioNoAutenticado.username
  );

  if (index === -1) {
    log.info(
      `Usuario ${
        usuarioNoAutenticado.username
      } no existe. No pudo ser autenticado.`
    );
    res.status(400).send("Credenciales incorrectas. El usuario no existe.");
    return;
  }

  let hashedPassword = usuarios[index].password;

  bcrypt.compare(
    usuarioNoAutenticado.password,
    hashedPassword,
    (_err, iguales) => {
      if (iguales) {
        let token = jwt.sign(
          {
            id: usuarios[index].id
          },
          "es un secretoooo (8)",
          { expiresIn: 86400 }
        );

        log.info(
          `Usuario ${usuarioNoAutenticado.username} completo la autenticación`
        );

        res.status(200).json({ token });
      } else {
        log.info(
          `Usuario ${
            usuarioNoAutenticado.username
          } falló la autenticación. Contraseña incorrecta.`
        );

        res
          .status(400)
          .send(
            "Credenciales incorrectas. Asegúrate que el username y la contraseña sean correctas"
          );
      }
    }
  );
});

module.exports = usuariosRouter;
