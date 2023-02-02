const { StatusCodes } = require("http-status-codes")
const Plan = require("../models/plan.model")
const getPlan = async(req,res)=>{
    let {plan_name} = req.body
    if(!plan_name){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Plan name is required"
                }
            ],
            data:null
        })
    }
    try{
        let plan = await Plan.findOne({"plan":plan_name})
        if(plan){
            return res.status(StatusCodes.OK).json({
                data:{
                    "plan":{
                        plan:plan.plan,
                        tokens:plan.tokens,
                        translate:plan.translate,
                        max_posts_once:plan.max_posts_once,
                        allow_download:plan.allow_download,
                        max_platforms:plan.max_platforms

                    }
                },
                errors:null
            })
        }else{
            return res.status(StatusCodes.NOT_FOUND).json({
                errors:[
                    {
                        msg:"Plan not found"
                    }
                ],
                data:null
            })
        }
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
    getPlan
}