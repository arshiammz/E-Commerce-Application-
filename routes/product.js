const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const checkSeller = require('../middleware/checkSeller');
const checkRole = require('../middleware/checkRole');
const Product = require('../models/product');
const Category = require('../models/category');
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
    const page = parseInt(req.query.page);
    const perPage = parseInt(req.query.perPage) || 8;

    const QueryCategory = req.query.category || null;
    const querySearch = req.query.search || null;


    let query = {}

    if(QueryCategory){
        const category = await Category.findOne({name: QueryCategory})
        
        if (!category) {
            return res.status(404).json({message: "Category not found!"})
        }

        query.category = category._id;
    }

    if (querySearch) {
        query.title = { $regex: querySearch, $options: "i"}
    }

    const products = await Product.find(query).select("-_id -seller -__v").skip((page - 1) * perPage ).limit(perPage);

    const totalProducts = await Product.countDocuments()
    const totalPages = Math.ceil(totalProducts / perPage);
    res.json({
        products: products,
        totalProducts,
        totalPages,
        currentPage: page,
        postPerPage: perPage
    });
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    const product = await Product.findById(id)
    .populate("seller", "_id name email")
    .populate("review.user", "_id name email")
    .select("-category -__v");

    if (!product){
        return res.status(404).json({message: "Product not found"})
    }

    res.json(product);
})


module.exports = router;