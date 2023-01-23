const {openai} = require("../connect/openai")
const CONSTANTS = require("../utils/utils")
const { getTranslatePrompt } = require("../utils/generatePrompts")
const Subscription = require("../models/subscription.model")
const translateCampaign = async (req, res) =>{
    let {posts_array, language} = req.body
    if(!posts_array){
        return res.json({
            errors:[{
                msg:"required posts array"
            }],
            data:null
        })
    }
    if(posts_array.length>CONSTANTS.MAX_NUM_POSTS){
        return es.json({
            errors:[{
                msg:`Max posts translation allowed is ${CONSTANTS.MAX_NUM_POSTS}`
            }],
            data:null
        })
    }

    if(!CONSTANTS.SUPPORTED_LANGUAGES.includes(language)){
        return res.json({
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
            resp = await openai.createCompletion({
                model: CONSTANTS.MODEL_DAVINCI,
                prompt: prompt,
                temperature: 0.3,
                max_tokens: req.output_tokens_length,
                top_p: 1.0,
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
                });
        }catch(error){
            return res.json({
                errors:[
                    {
                        msg:error.message
                    }
                ],
                data:null
            })
        }
        let temp = resp.data
        
                

                //updating tokens from "subscription" document
            const subs = await Subscription.findOne({"uid":req.uid})
            let finalTokens = Number(subs.tokens_left)-Number(temp.usage.total_tokens)
            if(finalTokens<0){
                finalTokens=0
            }
            subs.tokens_left = finalTokens
            let updatedSubs;
            try{
                updatedSubs = await subs.save()
            }catch(error){
                console.log("Error while updating subscriptn tokens after using")
            }
            res.json({
                errors:null,
                data:{
                    response: temp.choices[0].text,
                    finish_reason: temp.choices[0].finish_reason,
                    tokens_used: temp.usage.total_tokens,
                    tokens_left: updatedSubs.tokens_left
                }
            })

    
    
}

module.exports = {
    translateCampaign
}