const mongoose = require("mongoose");
var wordsSchema = new mongoose.Schema({
  email: {type: String, lowercase: true, unique: true,sparse:true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  words:{type: Number, default:0}
}, {timestamps: true});
const Words = mongoose.model("words", wordsSchema);
module.exports = Words;