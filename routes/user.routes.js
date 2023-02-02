const router = require("express").Router();
const middleware = require("../middleware/auth.middleware")
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model")
const { StatusCodes, OK } = require("http-status-codes");

router.get('/account',  middleware.authTokenVerifyMiddleware, async function (req, res) {
    try{
        const user = await User.findOne({"uid":req.uid})
        const userSubs = await Subscription.findOne({"uid":req.uid})
          
        if (!user || !userSubs) {
            return res.status(StatusCodes.NOT_FOUND).json({
                errors:[
                    {
                        msg:"User/Subscription not found"
                    }
                ],
                data:null
            })  
        } else {
            
            return res.status(StatusCodes.OK).json({
                errors:null,
                data:{
                    "user":{
                        name: user.name,
                        email: user.email,
                        verified : user.verified,
                        createdAt: user.createdAt

                    },
                    "subscription":{
                        tokens_left: userSubs.tokens_left,
                        end_date:userSubs.end_date,
                        top_up: userSubs.top_up,
                        plan:userSubs.plan,
                        status:userSubs.status
                    }
            }
        })
        }
    }catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).status(StatusCodes.OK).json({
            errors:null,
            data:{
                data:null,
                errors:[
                    {
                        msg:error.message
                    }
                ]
            }
        })
    }
})
module.exports = router;