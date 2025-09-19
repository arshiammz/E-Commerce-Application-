const express = require('express');
const router = express.Router();
const User = require('../models/users');


router.post('/', async (req, res) => {
    const {name, email, password, deliveryAddress} = req.body;
    const user = await User.findOne({email: email});

    if(user){
        res.status(400).json({message: "user already exits."})
    }

    const newUser = new User({
        name: name,
        email: email,
        password: password,
        deliveryAddress: deliveryAddress
    });

    await newUser.save();
    res.status(201).json(newUser);
});

module.exports = router;