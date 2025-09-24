const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const checkSeller = require('../middleware/checkSeller');
const checkRole = require('../middleware/checkRole');
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
    res.send("seller is here")
});


module.exports = router;