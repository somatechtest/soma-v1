const mongoose = require("mongoose");
//s_cid: "stripe customer id"
var planSchema = new mongoose.Schema({
  plan:{type: String, enum: ['none','free', 'pro_m', 'pro_a', 'elite_m', 'elite_a','topup_1','topup_2','topup_3'], default: 'none'},
  tokens:{type:Number, required:true},
  translate:{type:Boolean, required:true,default:false},
  max_posts_once:{type:Number, required:true},
  allow_download:{type:Boolean, required:true,default:false},
  stripe_price_id:{type:String,required:true}
}, {timestamps: true});

const Plan = mongoose.model("plans", planSchema);
module.exports = Plan;