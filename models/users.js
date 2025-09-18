const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: { type: string, required: true, minlenth: 3},
    email: { type: string, required: true, unique: true, lowecase: true},
    password: { type: string, required: true, minlenth: 5 },
    role: { type: string, enum: ["user","admin"], default: "user"}
});

const User = mongoose.model("User",userSchema);

module.exports = User