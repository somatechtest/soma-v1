const {openai} = require("../connect/openai")
const CONSTANTS = require("../utils/utils")
const { getTranslatePrompt } = require("../utils/generatePrompts")
const Subscription = require("../models/subscription.model")
const { StatusCodes } = require("http-status-codes")
const { updateTokensUsed } = require("./campaignHelper.controller")
const translateCampaign = async (req, res) =>{
    let {posts_array, language} = req.body
    if(!posts_array || !language){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:"required parameter missing"
            }],
            data:null
        })
    }
    if(posts_array.length>CONSTANTS.MAX_NUM_POSTS){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:`Max posts translation allowed is ${CONSTANTS.MAX_NUM_POSTS}`
            }],
            data:null
        })
    }

    if(!CONSTANTS.SUPPORTED_LANGUAGES.includes(language)){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:`unsupported language`
            }],
            data:null
        })
    }
    
    
    let prompt = req.prompt
        
    console.log("PROMPT ",prompt)
    console.log("INP TKNS ",req.input_tokens_length )
    console.log("OUP TKNS ",req.output_tokens_length )
    
        let resp;
        try{
            const resp = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: req.prompt}],
            });
            let temp = resp.data
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
        
        
                

                //updating tokens from "subscription" document
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

    
    
}

module.exports = {
    translateCampaign
}