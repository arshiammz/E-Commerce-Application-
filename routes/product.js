const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Product = require('../models/product');
const Category = require('../models/category');
const { title } = require('process');

const router = express.Router();

// ---- Upload config ----
const UPLOAD_DIR = path.join(__dirname, '../upload/products');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      // Ensure the upload directory exists (sync is fine here)
      if (!fsSync.existsSync(UPLOAD_DIR)) {
        fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const timeStamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    // sanitize filename to avoid path traversal & weird chars
    const safeBase = base.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, `${timeStamp}-${safeBase}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 8 },
});

// ---- Routes ----

// Create product
router.post(
  '/',
  authMiddleware,
  checkRole('seller'),
  upload.array('images', 8),
  async (req, res) => {
    try {
      const { title, description, category, price, stock } = req.body;

      const images = (req.files || []).map((image) => image.filename);
      if (!images.length) {
        return res.status(400).json({ message: 'At least one image is required!' });
      }

      if (!title || !category) {
        return res.status(400).json({ message: 'Title and category are required.' });
      }

      // Optional: coerce price/stock to numbers if provided
      const numericPrice = price !== undefined ? Number(price) : undefined;
      const numericStock = stock !== undefined ? Number(stock) : undefined;

      const newProduct = new Product({
        title,
        description,
        category,
        price: numericPrice,
        stock: numericStock,
        images,
        seller: req.user._id,
      });

      await newProduct.save();
      return res.status(201).json(newProduct);
    } catch (err) {
      console.error('POST /products error:', err);
      return res.status(500).json({ message: 'Server error creating product.' });
    }
  }
);

// List products with pagination / filtering
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const perPage = Number(req.query.perPage) > 0 ? Number(req.query.perPage) : 8;

    const queryCategory = req.query.category || null;
    const querySearch = req.query.search || null;

    const query = {};

    if (queryCategory) {
      const cat = await Category.findOne({ name: queryCategory }).lean();
      if (!cat) {
        return res.status(404).json({ message: 'Category not found!' });
      }
      query.category = cat._id;
    }

    if (querySearch) {
      query.title = { $regex: querySearch, $options: 'i' };
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .select('-__v')
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / perPage) || 1;

    return res.json({
      products,
      totalProducts,
      totalPages,
      currentPage: page,
      perPage,
    });
  } catch (err) {
    console.error('GET /products error:', err);
    return res.status(500).json({ message: 'Server error fetching products.' });
  }
});

router.get('/suggestion', async (req, res, next) => {
    try {    
    const search = req.query.search;
    const products = await product.find({title: {$regex: search, $options: "i"} }).select("_id title").limit(10);
    res.json(products);
    } catch (error) {
      next(error);
    }

});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id)
      .populate('seller', '_id name email')
      // If your schema uses "reviews", this will populate correctly; if it's "review", Mongoose will ignore safely.
      .populate('reviews.user', '_id name email')
      .select('-__v');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (err) {
    console.error('GET /products/:id error:', err);
    return res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// Delete product (admin or seller who owns it)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const productID = req.params.id;

    const product = await Product.findById(productID).select('seller images');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isOwner = String(req.user._id) === String(product.seller);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied: Only admin or seller can delete this product!' });
    }

    // Delete the product record
    await product.deleteOne();

    // Delete associated files, if any
    if (product.images && product.images.length > 0) {
      const deletions = product.images.map(async (imageName) => {
        const fullPath = path.join(UPLOAD_DIR, imageName);
        try {
          await fs.unlink(fullPath);
        } catch (error) {
          // Log but don't fail the entire request for a missing file
          console.error(`Error deleting file: ${fullPath}`, error);
        }
      });
      await Promise.allSettled(deletions);
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('DELETE /products/:id error:', err);
    return res.status(500).json({ message: 'Server error deleting product.' });
  }
});


module.exports = router;
