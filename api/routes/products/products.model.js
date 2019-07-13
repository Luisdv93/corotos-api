const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product must have a title']
  },
  price: {
    type: Number,
    min: 0,
    required: [true, 'Product must have a price']
  }
})