const express = require('express');
const authMiddleware = require('../middleware/auth');
const checkSeller = require('../middleware/checkSeller');
const checkRole = require('../middleware/checkRole');
const router = express.Router();

router.post('/',authMiddleware, checkRole('seller') , async (req, res) => {
    res.send("seller is here")
});


module.exports = router;