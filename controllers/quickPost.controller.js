const openai = require("../connect/openai")
const CONSTANTS = require("../utils/utils")
const {body, validationResult} = require('express-validator')
const middleware = require("../middleware/auth.middleware")
const planMiddleware = require("../middleware/plans.middleware")
const User = require("../models/user.model");
const { tokenMiddleware } = require("../middleware/tokens.middleware");

const Subscription = require("../models/subscription.model");
const { updateTokensUsed } = require("./campaignHelper.controller")
const { StatusCodes } = require("http-status-codes")

const createQuickPost = async function (req, res) {
    
    
    let resp;
    try{
        const resp = await openai.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: req.prompt}],
        });
        //console.log(resp.data.choices[0].message);
        // resp = await openai.openai.createCompletion({
        //     model: CONSTANTS.MODEL_DAVINCI,
        //     // prompt: prompt,
        //     prompt: req.prompt,
        //     // max_tokens: req.output_tokens_length,
        //     max_tokens: 1500,
        //     temperature: 0.9,
        // });
        let temp = resp.data
        console.log("TEMP ", temp)
    
            //updating tokens from "subscription" document
            await updateTokensUsed(req,res,temp)
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
module.exports={
    createQuickPost
}