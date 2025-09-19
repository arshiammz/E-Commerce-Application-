const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');


router.post('/', async (req, res) => {
    const {name, email, password, deliveryAddress} = req.body;
    const user = await User.findOne({email: email});

    if(user){
        res.status(400).json({message: "user already exits."})
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        deliveryAddress: deliveryAddress
    });

    await newUser.save();
    res.status(201).json(newUser);
});

module.exports = router;