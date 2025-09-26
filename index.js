require('dotenv').config();
const express = require('express');
const { default: mongoose } = require('mongoose');
const winston = require('winston')
require('winston-mongodb')
const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(),winston.format.json()),
    transports: [
        new winston.transports.Console({level: "debug"}),
        new winston.transports.File({
            filename:"logs/errors.log",
            level: "error"
        }),
        new winston.transports.MongoDB({
            db: "mongodb://localhost:27017/cartwish",
            level: "error"
        })
    ]
});

mongoose.connect("mongodb://localhost:27017/cartwish")
.then(() => console.log("MongoDB Connected Successfully!!"))
.catch((err) => console.log("MongoDB Connection Failed!", err));

app.use(express.json());
app.use("/images/category", express.static("upload?category"));
app.use("upload/products", express.static("upload/products"));

app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/products',productRoutes);

app.use((error, req, res, next) => {
    console.log("Error Middleware is running")
    logger.error(error.message, {
        method: req.method,
        path: req.originalUrl,
        stack: error.stack
    });
    return res.status(500).json({message: "Intenal Server Error!"});
});


app.listen(PORT, () => { logger.info(`Server is running on port ${PORT}`)});