const admin = require("firebase-admin");
const User = require("../models/user.model")
const Plan = require("../models/plan.model")
const CONSTANTS = require("../utils/utils");
const Subscription = require("../models/subscription.model");


/***
 * SIGN UP->LOGIN->VERIFY->LOGIN-> THE VERIFIED=TRUE IS NOT GETTING UPDATED
 * TODO: THIS MIDDLEWARE JUST APPENDS THE EXISTING PLAN DATA TO REQ OBJECTA AND REVERTS BACK IF USER HAS NONE PLAN
 * DONT UPDATE TOKENS IN THIS MIDDLEWARE
 * HANDLE FREE PLAN HERE, CASE WHEN USER CANCELS LAST PLAN AND NOW HE IS UNDER FREE PLAN, IF PLAN STATUS IS CANCELLED, CHECK HOW MUCH FREE PLAN HE HAS USED AND APPEND TE SAME 
 */
//TODO: SHOULD RETURN PLAN VALIDITY AND WORDS LEFT BASED ON THAT
async function planMiddleware(req,res,next){
    let uid = req.uid
    let customerId=null;    
    const subs = await Subscription.findOne({"uid":uid})
    // console.log("USER SBSCRIPTION ", subs)
    
    if(!subs){
        return res.json({
            errors:[
                {
                    msg:"User subscription not found"
                }
            ],
            data:null
        })
    }
    req.plan = subs.plan
    //if not verified plan will be none
    if(subs.plan == CONSTANTS.PLAN_NONE){
        return res.json({
            errors:[
                {
                    msg:"User does not have any plan"
                },
                {
                    msg:` email verified ${req.isVerified}`
                }
            ],
            data:null
        })
    }
    let today = new Date()
    let endDate = new Date(subs.end_date)
    // if(today.getTime()>endDate.getTime()){
    //     console.log("Plan has expired")
    //     //TODO CHECK FOR FREE PLAN ELIGIBILITY AND APPEND REQ OBJECT WITH FREE PLAN DATA
    // }
    if(subs.status == CONSTANTS.STATUS_NONE){
        console.log("User is under free plan")
        req.plan = CONSTANTS.PLAN_FREE
        //TODO CHECK FOR FREE PLAN ELIGIBILITY AND APPEND REQ OBJECT WITH FREE PLAN DATA
    }
    if(subs.status == CONSTANTS.STATUS_ACTIVE){
        console.log("User plan is active")
        req.plan = subs.plan
        //Allow further
    }else{
        req.plan = CONSTANTS.PLAN_FREE
        console.log(`Your subscription status is ${subs.status} but serving under free plan`)
        // return res.json({
        //     errors:[
        //         {
        //             msg:`Your subscription status is ${subs.status}`
        //         }
        //     ],
        //     data:null 
        // })
    }

    if(subs.tokens_left<=0 && subs.top_up <=0){
        return res.json({
            errors:[
                {
                    msg:"No tokens left please consider upgrading plan or buying some tokens"
                }
            ],
            data:null 
        })
    }

    
    req.end_date = subs.end_date
    req.status = subs.status
    req.tokens_left = subs.tokens_left
    req.subscription_model = subs
    next()
    console.log("LOGGING FROM PLANS MIDDLEWARE")
    console.log(req.plan)
    console.log(req.end_date)
    console.log(req.tokens_left)
    
}

module.exports.planMiddleware = planMiddleware