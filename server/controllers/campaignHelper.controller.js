const { StatusCodes } = require("http-status-codes");
const Campaign = require("../models/campaign.model");
const initCampaign = async (req, res) => {
    //check if name exists
    let {name} = req.body
    console.log(req.body)
    const camp = await Campaign.findOne({ uid: req.uid,name:name })
    if(camp){
        return res.json({
            errors:[
                {
                    msg:"campaign already exists, please choose a different name"
                }
            ],
            data:null
        })
    }else{
        //create a campaign
        try{
            let camp = new Campaign({
                name: name,
                uid: req.uid
              })
            
            let temp = await camp.save()
            return res.json({
                errors:null,
                data:{
                    "campaign":camp
                }
            })
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
    }
    //add validation for each key and its value
}

const getCampaign = async(req,res)=>{
    try{
        let id = req.query.id
        const camp = await Campaign.findOne({ uid: req.uid,_id:id })
        if(!camp){
            return res.status(StatusCodes.NOT_FOUND).json({
                errors:[
                    {
                        msg:"campaign does not exist try creating one"
                    }
                ],
                data:null
            })
        }else{
            return res.json({
                errors:null,
                data:{
                    "campaign":camp
                }
            })
        }
    }catch(error){
        return res.status(StatusCodes.NOT_FOUND).json({
            errors:[
                {
                    msg:error.message
                }
            ],
            data:null
        })
    }
}

const deleteCampaign = async(req,res)=>{
    let id = req.query.id
    const camp = await Campaign.findOne({ uid: req.uid,_id:id })
    if(!camp){
        return res.json({
            errors:[
                {
                    msg:"campaign does not exist try creating one"
                }
            ],
            data:null
        })
    }else{

        try{
            let deletedCamp = await camp.remove()
            return res.json({
                errors:null,
                data:{
                    "campaign":deletedCamp
                }
            })
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
        
    }
}

const updateCampaignName = async(req,res)=>{
    let newName = req.query.name
    let id = req.query.id
    const camp = await Campaign.findOne({ uid: req.uid,name:name })
    if(camp){
        return res.json({
            errors:[
                {
                    msg:"campaign already exists with this name"
                }
            ],
            data:null
        })
    }else{
        camp.name = newName
        let updatedCamp = await camp.save()
        return res.json({
            errors:null,
            data:{
                "campaign":updatedCamp
            }
        })
    }
}


//returns all campaigns created by user
//TODO: check and verify all query parameters here as shown in video and store-api example
const getAllDraftCampaigns = async(req,res)=>{
    // let name = req.query.name
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let preCamp = Campaign.find({ uid: req.uid, status:"draft"})
    preCamp = preCamp.skip(skip).limit(limit)
    let camp = await preCamp
    if(!camp){
        return res.json({
            errors:[
                {
                    msg:"No campaigns exist try creating one"
                }
            ],
            data:null
        })
    }else{
        return res.json({
            errors:null,
            data:{
                "campaigns":camp
            }
        })
    }
}


//returns all campaigns created by user
//TODO: check and verify all query parameters here as shown in video and store-api example
const getAllCompletedCampaigns = async(req,res)=>{
    // let name = req.query.name
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let preCamp = Campaign.find({ uid: req.uid, status:"completed"})
    preCamp = preCamp.skip(skip).limit(limit)
    let camp = await preCamp
    if(!camp){
        return res.json({
            errors:[
                {
                    msg:"No campaigns exist try creating one"
                }
            ],
            data:null
        })
    }else{
        return res.json({
            errors:null,
            data:{
                "campaigns":camp
            }
        })
    }
}

/***
 * 
 * TODO: USE THE BELOW FUNCTION EVERYHERE YOU ARE UPDATING TOKENS AFTER THE OPENAI CALL
 */

const updateTokensUsed = async(req,res,temp)=>{
            const subs = req.subscription_model
            let planTokensLeft = subs.tokens_left
            let topupTokensLeft = subs.top_up
            let tokensUsed = temp.usage.total_tokens;

            console.log("Updatig tokens ....")
            console.log("planTokensLeft ",planTokensLeft)
            console.log("topupTokensLeft ", topupTokensLeft)
            console.log("tokensUsed ", tokensUsed)
            
            if(tokensUsed<=planTokensLeft){
                //used left
                console.log("Case UPT1")
                planTokensLeft = Number(subs.tokens_left)-Number(tokensUsed)
            }else if(tokensUsed<(planTokensLeft+topupTokensLeft)){
                //used from both
                let rem = planTokensLeft-tokensUsed
                console.log("REM ",rem)
                console.log("Case UPT2")
                if(rem<0){
                    planTokensLeft = 0

                    topupTokensLeft = topupTokensLeft+rem
                }else{
                    planTokensLeft = 0
                }

            }
            
            subs.tokens_left = planTokensLeft
            subs.top_up = topupTokensLeft
            let updatedSubs;
            try{
                updatedSubs = await subs.save()
            }catch(error){
                console.log("Error while updating subscriptn tokens after using")
                return res.status(StatusCodes.OK).json({
                    errors:[
                        {
                            msg:error.message
                        }
                    ],
                    data:null
                })
            }
            console.log("topupTokensLeft ",topupTokensLeft)
            return res.status(StatusCodes.OK).json({
                errors:null,
                data:{
                    response: temp.choices[0].text,
                    finish_reason: temp.choices[0].finish_reason,
                    total_tokens_used: tokensUsed,
                    plan_tokens_left: planTokensLeft,
                    topup_tokens_left: topupTokensLeft
                }
            })
}


module.exports={
    initCampaign,
    getCampaign,
    getAllDraftCampaigns,
    getAllCompletedCampaigns,
    updateCampaignName,
    deleteCampaign,
    updateTokensUsed
}