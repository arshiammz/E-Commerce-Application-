const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const checkSeller = require('../middleware/checkSeller');
const checkRole = require('../middleware/checkRole');
const Product = require('../models/product');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/products')
    },
    filename: (req, file, cb) => {
        const timeStamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/, "");
        cb(null, `${timeStamp}-${originalName}`);
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif' ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type!"))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

router.post('/',authMiddleware, checkRole('seller'),upload.array("images", 8) , async (req, res) => {
    const {title, description, category, price, stock} = req.body;

    const images = req.files.map((image) => image.filename);
    if (images.length === 0){
        return res.status(400).json({message: "at least one image s required!"})
    }

    const newProduct = new Product({
        title,
        description,
        category,
        price,
        stock,
        images,
        seller: req.user._id,
    });

    await newProduct.save();
    res.status(201).json(newProduct);

});

router.get('/', async (req, res) => {
    const products = await Product.find().select("-_id -seller -__v");
    res.json(products);
});


module.exports = router;