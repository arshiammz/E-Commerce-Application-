const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authMiddleware = require('../middleware/auth')


const createUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    deliveryAddress: Joi.string().min(5).required()
});


router.post('/', async (req, res) => {
    const {name, email, password, deliveryAddress} = req.body;

    const joiValidation = createUserSchema.validate(req.body);
    if(joiValidation.error) {
        return res.status(400).json(joiValidation.error.details[0].message);
    };

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
    const token = generateToken({_id: newUser._id, name: newUser.name});
    res.status(201).json(token);
});

router.post('/login', async (req, res) => {
    //find user by email
    const {email, password} = req.body;
    const user = await User.findOne({email: email})
    if (!user) {
        return res.status(401).json({message: "Invalid crentials"});
    }

    // compare encrypted password
    const validPasssword = await bcrypt.compare(password, user.password);
    if (!validPasssword) {
        return res.status(401).json({message: "Invalid crentials"});
    }

    // create jwt and send the response
    const token =generateToken({_id: user._id, name: user.name});
    res.json(token);
});

router.get('/', authMiddleware, async(req, res) => {
    const user = req.user;
    const userData = await User.findById(req.user._id).select("-password")
    res.json(userData);
});


const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_KEY, {expiresIn: "1d"});
}

module.exports = router;