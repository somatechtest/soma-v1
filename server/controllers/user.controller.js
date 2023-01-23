/***
 * if verified give free plan
 * if not verified plan is none and tokensleft = null
 * 
 */

const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const middleware = require("../middleware/auth.middleware")
const User = require("../models/user.model")
const Plan = require("../models/plan.model")
const Subscription = require("../models/subscription.model")
const CONSTANTS = require("../utils/utils")
const {StatusCodes} = require('http-status-codes')

function validateName(name,req,res){
    if(name.length>20 || name.length<4){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Name length breached"
                }
            ],
            data:null
        })
    }
}

async function createUserAndSubscriptionInDB(req,res,_name,_email,_uid,_s_cid,_emialVerified,_plan,_tokensLeft,_endDate){
    try{
        
        let temp = await User.create({
            name:_name,
            email:_email,
            uid:_uid,
            s_cid:_s_cid,
            verified:_emialVerified
        })
        let subs = await Subscription.create({
            tokens_left: _tokensLeft, uid: _uid, end_date: _endDate,plan:_plan
        })

        return res.status(StatusCodes.OK).json({
            errors:null,
            data:{
                "user":temp,
                "subscription":subs
            }
        })
    }catch(error){
        console.log("user and subscription creation eroor ",error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errors:[
                {
                    msg:error.message
                }
            ],
            data:null
        })
    }
    
    
}

// call when login with google and normal login
async function loginUser(req,res){
    let mail = req.email;
    let uid = req.uid
    let emailVerified = req.isVerified
    let user = await User.findOne({"uid":uid})
    let temp=null;
    
    if(!user){
        if(emailVerified){
            
            //LOGGED IN WITH GOOGLE SO ADD TO DB COMPLETELY
            let customer = null
            let name = req.name
            console.log("CASE 1 (NAME)",name)
            
            
        let plan = await Plan.findOne({"plan":CONSTANTS.PLAN_FREE})
        let tokens = 0
        if(plan){
            tokens = plan.tokens
        }else{
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors:[
                    {
                        msg:"Free plan does not exist"
                    }
                ],
                data:null
            })
        }
        date = new Date()
        //adding 1 month
        date.setMonth(date.getMonth() + 1)
        plan = CONSTANTS.PLAN_FREE
        customer = await Stripe.addNewCustomer(mail,uid)
        await createUserAndSubscriptionInDB(req,res,name,mail,uid,customer.id,emailVerified,plan,tokens,date)

            
        }else{
            console.log("CASE 2")
            return res.status(StatusCodes.NOT_FOUND).json({
                errors:[
                    {
                        msg:"User does not exist please sign up"
                    }
                ],
                data:null
            })
        }
        
        
        
    }else{
        if(!emailVerified){
            console.log("CASE 3")
            return res.status(StatusCodes.FORBIDDEN).json({
                errors:[
                    {
                        msg:"Unverified email"
                    }
                ],
                data:null
            })
        }else{
            if(user.s_cid==null){
                console.log("CASE 5")
                let customerId
                try{
                    customerId = await Stripe.addNewCustomer(mail,uid)
                }catch(error){
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        errors:[
                            {
                                msg:error.message
                            }
                        ],
                        data:null
                    })
                }
        
                let plan = await Plan.findOne({"plan":CONSTANTS.PLAN_FREE})
                let subs = await Subscription.findOne({"uid":uid})
                
                let tokens
                if(plan){
                    tokens = plan.tokens
                }else{
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        errors:[
                            {
                                msg:"Free plan does not exist"
                            },
                            {
                                msg:"something went wrong from server side"
                            }
                        ],
                        data:null
                    })
                }
                date = new Date()
                //adding 1 month
                date.setMonth(date.getMonth() + 1)
                plan = CONSTANTS.PLAN_FREE
                user.s_cid = customerId.id
                user.verified = emailVerified
                user.tokens_left = tokens
        
                //UPDATING SUBSCRIPTION
                subs.tokens_left = tokens
                subs.plan = plan
                subs.end_date = date
                subs.uid = uid
        
        
                try{
                    let saved = await user.save()
                    let subsSaved = await subs.save()
                    return res.status(StatusCodes.OK).json({
                        errors:null,
                        data:{
                            "user":saved,
                            "subscription":subsSaved
                        }
                    })
                }catch(err){
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        errors:[
                            {
                                msg:err.message
                            }
                        ],
                        data:null
                    })
                }
            }
        }
        console.log("CASE 4")
    }
    
}


//called while signing up using email and pwd, creates plan as none 
async function signUpUser(req,res){
    let mail = req.email;
    let uid = req.uid
    let emailVerified = req.isVerified
    let name=null;
    
    if(!req.body.loginWithGoogle){
        name = req.body.name
        validateName(name)
    }else{
        name = req.name
    }
    
    let user = await User.findOne({uid})
    if(user){
        return res.status(StatusCodes.CONFLICT).json({
            errors:[
                {
                    msg:"Email already used"
                }
            ],
            data:null
        })
    }
    if(name.length>20 || name.length<4){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Name length breached"
                }
            ],
            data:null
        })
    }
    let customerId = null
    //ADDIND CUSTOMER TO STRIPE AND GIVING HIM FREE PLAN ONLY IF HE IS VERIFIED 
    let date = null;
    let userPlan = "none"
    let tokens=0
   

    await createUserAndSubscriptionInDB(req,res,name,mail,uid,customerId,emailVerified,userPlan,tokens,date)
}

module.exports = {
    signUpUser,
    loginUser
}