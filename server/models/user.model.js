const mongoose = require("mongoose");
//s_cid: "stripe customer id"
var userSchema = new mongoose.Schema({
  name: {type: String, maxLength:[20, "Max length for name breached"],trim:true, minLength:[4, "Min length for name breached"], required: [true, "name can't be blank"]},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  uid: {type: String, required: [true, "uid can't be blank"], index: true},
  //STRIPE CUSTOMER ID
  s_cid: {type: String, default:null, unique: true, index: true},
  verified:{type:Boolean, default:false},
  has_trial:{type:Boolean, default:true},
  //STRIPE SUBSCRIPTION ID
  subs_id:{type: String, default:null}
}, {timestamps: {createdAt:true,updatedAt:false}});

const User = mongoose.model("users", userSchema);
module.exports = User;