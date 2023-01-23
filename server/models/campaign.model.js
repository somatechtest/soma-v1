const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  image: { type: String, default: null }
})


const campaignSchema = new mongoose.Schema({
  uid: {type: String, required: [true, "uid can't be blank"], index: true},
  //TODO: HANDLE CASING IN NAME
  name: {type: String, maxLength:[40, "Max length for name breached"],trim:true, minLength:[3, "Min length for name breached"], required: [true, "name can't be blank"], index: true},
  campaign_description:{type:String},
  tones: [{type:String}],
  num_posts:{type:Number},
  goal:{type:String},
  product_name:{type:String},
  product_description:{type:String},
  benefits:{type:String},
  instagram:[{type:postSchema, default:null}],
  facebook:[{type:postSchema, default:null}],
  twitter:[{type:postSchema, default:null}],
  linkedin:[{type:postSchema, default:null}],
  include_images:{type:Boolean,default:false},
  include_hashtags:{type:Boolean,default:false},
  length:{type:String,enum:["short","optimum","long"],default:"optimum"},
  status: {type:String,enum:["completed","draft"],default:"draft"}
}, {timestamps: true})

const Campaign = mongoose.model("campaigns", campaignSchema);
module.exports = Campaign;