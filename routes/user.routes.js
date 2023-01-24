const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const {body, validationResult} = require('express-validator')
const middleware = require("../middleware/auth.middleware")
const User = require("../models/user.model")

router.get('/account',  middleware.authTokenVerifyMiddleware, async function (req, res) {
    const email = req.email
    const user = await User.findOne({"email":email})
      
    if (!user) {
        res.json({
            errors:[
                {
                    msg:"User not found"
                }
            ],
            data:null
        })  
    } else {
        res.json({
            errors:null,
            data:user
        })
    }
})
module.exports = router;