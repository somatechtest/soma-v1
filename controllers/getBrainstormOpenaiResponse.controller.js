const Subscription = require("../models/subscription.model");
const CONSTANTS = require("../utils/utils")
const openai = require("../connect/openai");
const { updateTokensUsed } = require("./campaignHelper.controller");
const getBrainstormOpenaiResponse = async function (req, res) {
    
    try{
        let resp = await openai.openai.createCompletion({
            model: CONSTANTS.MODEL_CURIE,
            // prompt: prompt,
            prompt: req.prompt,
            max_tokens: req.output_tokens_length,
            temperature: 0,
        });

        let temp = resp.data
    
            //updating tokens from "subscription" document
            await updateTokensUsed(req,res,temp)
            // const subs = await Subscription.findOne({"uid":req.uid})
            // let finalTokens = Number(subs.tokens_left)-Number(temp.usage.total_tokens)
            // if(finalTokens<0){
            //     finalTokens=0
            // }
            // subs.tokens_left = finalTokens
            // let updatedSubs;
            // try{
            //     updatedSubs = await subs.save()
            // }catch(error){
            //     console.log("Error while updating subscriptn tokens after using")
            // }
            // res.json({
            //     errors:null,
            //     data:{
            //         response: temp.choices[0].text,
            //         finish_reason: temp.choices[0].finish_reason,
            //         tokens_used: temp.usage.total_tokens,
            //         tokens_left: updatedSubs.tokens_left
            //     }
            // })
    }catch(error){
        res.json({
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
    getBrainstormOpenaiResponse
}