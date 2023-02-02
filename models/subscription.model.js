const mongoose = require("mongoose");
//s_cid: "stripe customer id"
var subscriptionSchema = new mongoose.Schema({
  tokens_left:{type:Number, required:true},
  uid:{type:String,required:true, index:true},
  end_date: { type: Date, default: null },
  status:{type:String, default: "none"},
  top_up:{type:Number, default:0},
  top_up_date:{type:Date},
  //TODO: USE STATUS HERE INSTEAD OF END DATE
  //m-monthly a-annual
  plan:{type: String, enum: ['none','free', 'pro_m', 'pro_a', 'elite_m', 'elite_a'], default: 'none'},
});

const Subscription = mongoose.model("subscriptions", subscriptionSchema);
module.exports = Subscription;