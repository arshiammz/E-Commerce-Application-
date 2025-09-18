const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/cartwish")
.then(() => console.log("MongoDB Connected Successfully!!"))
.catch((err) => console.log("MongoDB Connection Failed!", err));


app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`)});