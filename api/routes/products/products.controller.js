const Product = require("./products.model");

const createProduct = (product, owner) => {
  return new Product({...product, owner}).save();
}

const getProducts = () => {
  return Product.find({});
}

const getProduct = id => {
  return Product.findById(id);
}

const deleteProduct = id => {
  return Product.findByIdAndRemove(id);
}

const updateProduct = (id, product, owner) => {
  // New returns the updated document
  return Product.findOneAndUpdate({_id: id}, { ...product, owner }, { new: true })
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct
}