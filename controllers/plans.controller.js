const { StatusCodes } = require("http-status-codes")
const Plan = require("../models/plan.model")
const getPlan = async(req,res)=>{
    let {plan_name} = req.body
    try{
        let plan = await Plan.findOne({"plan":plan_name})
        if(plan){
            return res.status(StatusCodes.OK).json({
                data:{
                    "plan":plan
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
module.exports = {
    getPlan
}