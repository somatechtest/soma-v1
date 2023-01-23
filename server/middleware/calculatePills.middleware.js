import { calculatePillsFunc } from "../utils/calculateCreatePillsFunc";

const calculatePillsMiddleware = async(req,res,next)=>{
     let tokReq = calculatePillsFunc(req,res)
     req.tokens_required = tokReq

}

module.exports={
    calculatePillsMiddleware
}