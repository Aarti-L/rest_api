const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true, unique:true },
  description: { type: String, required: true },
  price: { type: Number, default: 1, min: 1 },
  stock: { type: Number, default: 0, min: 0 }
}, {timestamps:true});

module.exports = mongoose.model('Product', productSchema);
