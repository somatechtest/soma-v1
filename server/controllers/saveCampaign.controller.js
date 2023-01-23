const { StatusCodes } = require("http-status-codes")
const Campaign = require("../models/campaign.model")
const { POST_LENGTH_ARRAY, CAPMAIGN_STATES_ARRAY } = require("../utils/utils")

//TODO: validate all body params before adding to db
//campaign name cannot be updated here there will be differenct route for that 
const saveCampaign = async (req, res) => {
    //check if name exists
    let campId = req.query.id
    let {  campaign_description,tones,num_posts,goal,product_name,product_description,benefits,instagram,
        facebook, twitter,linkedin, include_images, include_hashtags, length, status} = req.body
    //RUN VALIDATORS FOR BODY 
    //find with id and uid match so that no other people can update this
    const camp = await Campaign.findOne({ uid:req.uid,_id:campId })
    if(!camp){
        return res.status(StatusCodes.NOT_FOUND).json({
            errors:[
                {
                    msg:"No campaigns exist"
                }
            ],
            data:null
        })
    }
    if(!POST_LENGTH_ARRAY.includes(length)){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"invalid length"
                }
            ],
            data:null
        })
    }
    if(!CAPMAIGN_STATES_ARRAY.includes(status)){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"invalid status"
                }
            ],
            data:null
        })
    }
    camp.campaign_description = campaign_description
    camp.tones = tones
    camp.num_posts = num_posts
    camp.goal = goal
    camp.product_name = product_name
    camp.product_description = product_description
    camp.benefits = benefits
    camp.instagram = instagram
    camp.facebook = facebook
    camp.twitter = twitter
    camp.linkedin = linkedin
    camp.include_images = include_images
    camp.include_hashtags = include_hashtags
    camp.length = length
    camp.status = status


    try{
        let updatedCamp = await camp.save()
        return res.json({
            errors:null,
            data:{
                "campaign":updatedCamp
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
    console.log("REQ SAVE ", linkedin)
    //add validation for each key and its value
}

module.exports={
    saveCampaign
}