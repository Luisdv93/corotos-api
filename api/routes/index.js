const express = require("express");
const router = express.Router();

router.use("/products", require("./products/products.routes"));
router.use("/users", require("./users/users.routes"));

module.exports = router;

