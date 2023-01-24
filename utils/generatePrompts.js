const CONSTANTS = require("../utils/utils")
const getRegeneratePrompt = (req,res)=>{
    let {  campaign_description,tones,num_posts,goal,product_name,product_description,benefits,instagram,
        facebook, twitter,linkedin,length} = req.body

        let prompt = "prompt"

}
const getCreatePrompt = (req,res)=>{
    let {  campaign_description,tones,num_posts,goal,product_name,product_description,benefits,platform,length} = req.body

    console.log("CREATE PROMPT RUNNING")
    //checking for invalid platform
    if(!CONSTANTS.SUPPORTED_PLATFORMS.includes(platform.toLowerCase())){
        return res.json({
            errors:[{
                msg:`unsupported platform ${platform}`
            }],
            data:null
        })
    }
    
    //checking for invalid tone
    //TODO: CHECK MAX DESC LENGTH
    let toneText=" ";
    if(tones.length>0){
        if(tones.length>CONSTANTS.MAX_TONES_SUPPORTED){
            return res.json({
                errors:[
                    {
                        msg:`supports at max ${CONSTANTS.MAX_TONES_SUPPORTED} tones`
                    }
                ],
                data:null
            })
        }
        for(let i=0;i<tones.length;i++){
            if(!CONSTANTS.SUPPORTED_TONES.includes(tones[i].toLowerCase())){
                return res.json({
                    errors:[
                        {
                            msg:`unsupported tone found ${tones[i]}`
                        }
                    ],
                    data:null
                })
            }
            toneText = toneText+tones[i]+" , "
        }
    }
    
    if(num_posts>CONSTANTS.MAX_NUM_POSTS){
        return res.json({
            errors:[{
                msg:`Exceeded max post limit ${CONSTANTS.MAX_NUM_POSTS}`
            }],
            data:null
        })
    }
    if(product_description.length==0){
        return res.json({
            errors:[{
                msg:`Invalid description`
            }],
            data:null
        })
    }
    
    switch (platform){
        case CONSTANTS.TWITTER:{
            if(toneText.length>1){
                prompt = `generate ${num_posts} tweets with tones ${toneText} for given description\ndescription: ${product_description} \n 1)`
            }else{
                prompt = `generate ${num_posts} tweets for given description\ndescription: ${product_description} \n 1)`
            }
            break
        }
        case CONSTANTS.FACEBOOK:{
            break
        }
        case CONSTANTS.INSTAGRAM:{
            break
        }
        case CONSTANTS.LINKEDIN:{
            break
        }
        default:{
            return res.json({
                errors:["unsupported platform"],
                data:null
            })
        }
    }

    console.log("PROMPT ",prompt)
        
    return prompt

}
const getTranslatePrompt = (req,res)=>{
    let {  posts_array, language} = req.body

        let text = "\n"
        for(let i=1;i<=posts_array.length;i++){
            text = text+i+")"+posts_array[i-1]+" \n"
            
        }
        let prompt = `Translate these into ${language} ${text}`
        console.log("TRANSLATE ",prompt)
        return prompt

}

module.exports = {
    getCreatePrompt,
    getRegeneratePrompt,
    getTranslatePrompt
}