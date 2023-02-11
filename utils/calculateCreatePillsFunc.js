/***
 * GENERATE PROMPT HERE AND GET PILLS REQUIRED
 */

const CONSTANTS = require("./utils")
const { getCreatePrompt, getTranslatePrompt, getCreateQuickPostPrompt } = require("./generatePrompts")
const calculateCreatePillsFunc =  (req,res)=>{
    let {  campaign_description,tones,num_posts,goal,product_name,product_description,benefits,instagram,
        facebook, twitter,linkedin,length} = req.body

        
        //avg tone length is taken as 7
    let promptGen = getCreatePrompt(req,res)
    //openai cost per char
    let avgPostLenShort = 30 //chars
    let avgPostLenOpt = 40
    let avgPostLenLong = 50 //chars
    let outLen = 0
    if(length == CONSTANTS.LENGTH_SHORT){
        outLen = avgPostLenShort*num_posts
    }
    if(length == CONSTANTS.LENGTH_OPTIMUM){
        outLen = avgPostLenOpt*num_posts
    }
    if(length == CONSTANTS.LENGTH_LONG){
        outLen = avgPostLenLong*num_posts
    }
    //calculating the tokens length for response currently 1.5 times reqd
    outLen = Math.round(outLen*1.5)
    let output_tokens_length = Math.round(outLen/4)

    //input token len + output token len
    let strlen = (promptGen.length+(tones.length*7))
    // A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for common 
    //English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).
    let input_tokens_length = strlen/4
    // let prompt = `give me ${num_posts} tweets on a product ${product_name} and the description is ${product_description}`
    return {
        input_tokens_length, prompt, output_tokens_length
    }
}

const calculateCreateQuickPostPillsFunc =  (req,res)=>{
    let {  tone,goal,product_name,product_description,platforms,include_image,include_hashtags,length} = req.body
    let num_posts = 1
        
        //avg tone length is taken as 7
    let prompt = getCreateQuickPostPrompt(req,res)
    //openai cost per char
    let avgPostLenShort = 300 //chars
    let avgPostLenOpt = 400
    let avgPostLenLong = 500 //chars
    let outLen = 0
    // if(length == CONSTANTS.LENGTH_SHORT){
    //     outLen = avgPostLenShort*num_posts
    // }
    // if(length == CONSTANTS.LENGTH_OPTIMUM){
    //     outLen = avgPostLenOpt*num_posts
    // }
    // if(length == CONSTANTS.LENGTH_LONG){
    //     outLen = avgPostLenLong*num_posts
    // }
    outLen = avgPostLenOpt*platforms.length
    //calculating the tokens length for response currently 1.5 times reqd
    outLen = Math.round(outLen*1.5)
    let output_tokens_length = Math.round(outLen/4)

    //input token len + output token len
    let strlen = (prompt.length+(tone.length*7))
    // A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for common 
    //English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).
    let input_tokens_length = strlen/4
    // let prompt = `give me ${num_posts} tweets on a product ${product_name} and the description is ${product_description}`
    return {
        input_tokens_length, prompt, output_tokens_length
    }
}

const calculateTranslatePillsFunc =  (req,res)=>{
    let {  campaign_description,tones,num_posts,goal,product_name,product_description,benefits,instagram,
        facebook, twitter,linkedin,length} = req.body

        //avg tone length is taken as 7
    let prompt = getTranslatePrompt(req,res)

    let outLen = Math.round(prompt.length*1.5)
    
    // A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for common 
    //English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).

    let input_tokens_length = Math.round(prompt.length/4)
    let output_tokens_length = Math.round(outLen/4)
    // let prompt = `give me ${num_posts} tweets on a product ${product_name} and the description is ${product_description}`
    return {
        input_tokens_length, prompt, output_tokens_length
    }
    
    
}
const calculateBrainstormPillsFunc =  (req,res)=>{
    let {  prompt, length} = req.body
    let outLen
    if(!CONSTANTS.POST_LENGTH_ARRAY.includes(length)){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"invalid length"
                }
            ],
            data:null
        })
    }
    if(length==CONSTANTS.LENGTH_LONG){
        outLen = 600
    }
    if(length==CONSTANTS.LENGTH_SHORT){
        outLen = 400
    }
    
    // A helpful rule of thumb is that one token generally corresponds to ~4 characters of text for common 
    //English text. This translates to roughly ¾ of a word (so 100 tokens ~= 75 words).

    let input_tokens_length = Math.round(prompt.length/4)
    let output_tokens_length = Math.round(outLen/4)
    // let prompt = `give me ${num_posts} tweets on a product ${product_name} and the description is ${product_description}`
    return {
        input_tokens_length, prompt, output_tokens_length
    }
    
    
}
module.exports = {
    calculateCreatePillsFunc,
    calculateTranslatePillsFunc,
    calculateBrainstormPillsFunc,
    calculateCreateQuickPostPillsFunc
}