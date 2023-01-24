const mongoose = require("mongoose");
//s_cid: "stripe customer id"
var paymentsSchema = new mongoose.Schema({
    s_cid:{type:String, required:true, index:true},
    subscription:{type:String, required:true},
    status:{type:String, required:true},
  
}, {
    timestamps: { createdAt: true, updatedAt: false }
  });

const Payment = mongoose.model("payments", paymentsSchema);
module.exports = Payment;