const admin = require("firebase-admin");
const Subscription = require("../models/subscription.model")
const CONSTANTS = require("../utils/utils")
const Plan = require("../models/plan.model");
const { calculateCreatePillsFunc, calculateTranslatePillsFunc, calculateBrainstormPillsFunc, calculateCreateQuickPostPillsFunc } = require("../utils/calculateCreatePillsFunc");
const { StatusCodes } = require("http-status-codes");

/***
 * SIGN UP->LOGIN->VERIFY->LOGIN-> THE VERIFIED=TRUE IS NOT GETTING UPDATED {fixed}
 * SHOULD CALCULATE THE TOKENS REQUIRED TO PERFORM ACTION AND REVERT IF TOKENS NOT ENOGH OR REQUESTING MORE THAN WHAT THE PLA IS ASKING
 * CHECK STATUS AND IF STATUS IS NOT ACTIVE PROVIDE FREE PLAN
 */

function compareTokens(req,res,input_tokens_length,output_tokens_length){
    try{
    let subsModel = req.subscription_model
    if(subsModel.tokens_left>=input_tokens_length+output_tokens_length){
        console.log("Serving with tokens left from plan")
       return
    }else if((subsModel.tokens_left+subsModel.top_up)>=input_tokens_length+output_tokens_length){
        console.log("Serving with topup tokens and tokens left from plan")
       return
    }
    return res.status(StatusCodes.FORBIDDEN).json({
        errors:[
            {
                msg:"Costing more tokens than available",
                input_tokens_length: input_tokens_length,
                output_tokens_length: output_tokens_length,
                tokens_left: subsModel.tokens_left,
                top_up: subsModel.top_up
            }
        ],
        data:null
    })
    }catch(error){

        console.log(error.stack)
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

async function tokenMiddleware(req,res,next){
    let uid = req.uid
    let userPlan = req.plan
    let userTokensLeft = req.tokens_left
    let userEndDate = req.end_date
    let subsStatus = req.status
    let {length,num_posts} = req.body
    if(!length || !num_posts){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:"required parameter missing"
            }],
            data:null
        })
    }
    

    //checking plan status
    try{
    if(req.status!=CONSTANTS.STATUS_ACTIVE){
        console.log("NO PLAN IS ACTIVE SERVING UNDER FREE PLAN")
    }

    //fetching more details aout the "plan"
    let planDetails = await Plan.findOne({"plan":userPlan})
    console.log("PLAN ", userPlan)
    // console.log("LOGS FROM TOKENS MIDDLEWARE planDetails",planDetails)
    //read body requirements and check for validation and tokens further
    //check for num_posts should be less than max in the plan
    
    if(planDetails.max_posts_once<num_posts){
        return res.status(StatusCodes.FORBIDDEN).json({
            errors:[
                {
                    msg:`Your plan allows at max ${planDetails.max_posts_once}`
                }
            ],
            data:null
        })
    }
    let {input_tokens_length,prompt, output_tokens_length} = calculateCreatePillsFunc(req,res)
    console.log("TOKENS LEFT ",userTokensLeft)
    console.log("TOKENS REQ ",input_tokens_length)

    compareTokens(req,res,input_tokens_length,output_tokens_length)
    // if(input_tokens_length+output_tokens_length>req.tokens_left){
    //     return res.status(StatusCodes.FORBIDDEN).json({
    //         errors:[
    //             {
    //                 msg:"Costing more tokens than available"
    //             }
    //         ],
    //         data:null
    //     })
    // }
    req.prompt = prompt
    req.input_tokens_length = input_tokens_length
    req.output_tokens_length = output_tokens_length

    //get input tokens
    
    
    next()
    }catch(error){

        console.log(error.stack)
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

async function tokenQuickPostMiddleware(req,res,next){
    let uid = req.uid
    let userPlan = req.plan
    let userTokensLeft = req.tokens_left
    let userEndDate = req.end_date
    let subsStatus = req.status
    let {length,num_posts} = req.body
    if(!length || !num_posts){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:"required parameter missing"
            }],
            data:null
        })
    }

    try{
    //checking plan status
    if(req.status!=CONSTANTS.STATUS_ACTIVE){
        console.log("NO PLAN IS ACTIVE SERVING UNDER FREE PLAN")
    }

    //fetching more details aout the "plan"
    let planDetails = await Plan.findOne({"plan":userPlan})
    console.log("PLAN ", userPlan)
    // console.log("LOGS FROM TOKENS MIDDLEWARE planDetails",planDetails)
    //read body requirements and check for validation and tokens further
    //check for num_posts should be less than max in the plan
    
    if(planDetails.max_posts_once<num_posts){
        return res.status(StatusCodes.FORBIDDEN).json({
            errors:[
                {
                    msg:`Your plan allows at max ${planDetails.max_posts_once}`
                }
            ],
            data:null
        })
    }
    let {input_tokens_length,prompt, output_tokens_length} = calculateCreateQuickPostPillsFunc(req,res)
    console.log("TOKENS LEFT ",userTokensLeft)
    console.log("TOKENS REQ ",input_tokens_length)

    compareTokens(req,res,input_tokens_length,output_tokens_length)
    // if(input_tokens_length+output_tokens_length>req.tokens_left){
    //     return res.status(StatusCodes.FORBIDDEN).json({
    //         errors:[
    //             {
    //                 msg:"Costing more tokens than available"
    //             }
    //         ],
    //         data:null
    //     })
    // }
    req.prompt = prompt
    req.input_tokens_length = input_tokens_length
    req.output_tokens_length = output_tokens_length

    //get input tokens
    
    
    next()
    }catch(error){

        console.log(error.stack)
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

async function tokenTranslateMiddleware(req,res,next){
    let uid = req.uid
    let userPlan = req.plan
    let userTokensLeft = req.tokens_left
    let userEndDate = req.end_date
    let subsStatus = req.status
    let {language,posts_array} = req.body
    if(!posts_array || !language){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:"required parameter missing"
            }],
            data:null
        })
    }
    //checking plan status
    try{
    if(req.status!=CONSTANTS.STATUS_ACTIVE){
        console.log("NO PLAN IS ACTIVE SERVING UNDER FREE PLAN")
    }

    //fetching more details aout the "plan"
    let planDetails = await Plan.findOne({"plan":userPlan})
    console.log("PLAN ", userPlan)
    // console.log("LOGS FROM TOKENS MIDDLEWARE planDetails",planDetails)
    //read body requirements and check for validation and tokens further
    //check for num_posts should be less than max in the plan
    
    if(planDetails.max_posts_once<posts_array.length){
        return res.status(StatusCodes.FORBIDDEN).json({
            errors:[
                {
                    msg:`Your plan allows at max ${planDetails.max_posts_once}`
                }
            ],
            data:null
        })
    }
    if(!planDetails.translate){
        return res.status(StatusCodes.FORBIDDEN).json({
            errors:[
                {
                    msg:`Your plan does not allow translation, consider for an upgrade`
                }
            ],
            data:null
        })
    }
    let {input_tokens_length,prompt, output_tokens_length} = calculateTranslatePillsFunc(req,res)
    console.log("TOKENS LEFT ",userTokensLeft)
    console.log("TOKENS REQ ",input_tokens_length)
    compareTokens(req,res,input_tokens_length,output_tokens_length)
    req.prompt = prompt
    req.input_tokens_length = input_tokens_length
    req.output_tokens_length = output_tokens_length

    //get input tokens
    
    
    next()
}catch(error){

    console.log(error.stack)
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

async function tokenBrainstormMiddleware(req,res,next){
    let uid = req.uid
    let userPlan = req.plan
    let userTokensLeft = req.tokens_left
    let userEndDate = req.end_date
    let subsStatus = req.status

    //checking plan status
    if(req.status!=CONSTANTS.STATUS_ACTIVE){
        console.log("NO PLAN IS ACTIVE SERVING UNDER FREE PLAN")
    }

    //fetching more details aout the "plan"
    try{
    let planDetails = await Plan.findOne({"plan":userPlan})
    console.log("PLAN ", userPlan)
    // console.log("LOGS FROM TOKENS MIDDLEWARE planDetails",planDetails)
    //read body requirements and check for validation and tokens further
    //check for num_posts should be less than max in the plan
    
    
    let {input_tokens_length, prompt,  output_tokens_length} = calculateBrainstormPillsFunc(req,res)
    console.log("TOKENS LEFT ",userTokensLeft)
    console.log("TOKENS REQ ",input_tokens_length)

    

    compareTokens(req,res,input_tokens_length,output_tokens_length)
    req.prompt = prompt
    req.input_tokens_length = input_tokens_length
    req.output_tokens_length = output_tokens_length

    //get input tokens
    
    
    next()
}catch(error){

    console.log(error.stack)
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




module.exports = {
    tokenMiddleware,
    tokenTranslateMiddleware,
    tokenBrainstormMiddleware,
    tokenQuickPostMiddleware
}