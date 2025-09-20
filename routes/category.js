const express = require("express");
const router = express.Router();
const multer = require('multer');
const Category = require('../models/category');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/category')
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

router.post("/", upload.single("icon"), async (req, res) => {
    if (!req.body.name || !req.file) {
        return res.status(400).json({message: "Name and icon are rquired!"});
    }

    const newCategory = new Category({
        name: req.body.name,
        image: req.file.filename
    })

    await newCategory.save();
    res.status(201).json({
        message: "Category added successfully!",
        category: newCategory
    });
});


module.exports = router;