const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product must have a title.']
  },
  price: {
    type: Number,
    min: 0,
    required: [true, 'Product must have a price.']
  },
  coin : {
    type: String,
    maxlength: 3,
    minlength: 3,
    required: [true, 'Product must have a coin.']
  },
  owner: {
    type: String,
    required: [true, 'Product must be associated to an user.']
  }
})

module.exports = mongoose.model("product", productSchema)