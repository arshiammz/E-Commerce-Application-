const { ref, required } = require('joi');
const mongoose = require('mongoose');
const Category = require('./category');
const User = require('./users');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlenght: 100},
    description: { type: String, required: true, minlenght: 50},
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    price: { type: Number, required: true, min: 0},
    stock: { type: Number, required: true, min: 0},
    images: {type: [String], required: true},
    review:[
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
            rating: { type: Number, required: true, min: 0},
            comment: {type: String}
        }
    ]
});

const Product = mongoose.model("Product",productSchema);

module.exports = Product;