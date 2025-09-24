require('dotenv').config();
const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

mongoose.connect("mongodb://localhost:27017/cartwish")
.then(() => console.log("MongoDB Connected Successfully!!"))
.catch((err) => console.log("MongoDB Connection Failed!", err));

app.use(express.json());
app.use("/images/category", express.static("upload?category"));
app.use("upload/products", express.static("upload/products"));

app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/products',productRoutes);



app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`)});