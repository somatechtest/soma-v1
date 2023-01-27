const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const {body, validationResult} = require('express-validator')
const middleware = require("../middleware/auth.middleware")
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model")
const { StatusCodes, OK } = require("http-status-codes");

router.get('/account',  middleware.authTokenVerifyMiddleware, async function (req, res) {
    const email = req.email
    const user = await User.findOne({"uid":req.uid})
    const userSubs = await Subscription.findOne({"uid":req.uid})
      
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
            errors:[
                {
                    msg:"User not found"
                }
            ],
            data:null
        })  
    } else {
        return res.status(StatusCodes.OK).json({
            errors:null,
            data:{
                "user":user,
                "subscription":userSubs
            }
        })
    }
})
module.exports = router;