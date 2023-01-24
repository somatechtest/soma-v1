const { StatusCodes } = require("http-status-codes")
const {calculatePillsFunc} = require("../utils/calculateCreatePillsFunc") 

const CONSTANTS = require("../utils/utils")
const calculatePills = async(req,res)=>{
    let token = calculatePillsFunc(req,res)
    return res.status(StatusCodes.OK).json({
        errors:null,
        data : {
            tokens:token
        }
    })
    //display this count by multiplying the number of platforms
}
module.exports={
    calculatePills
}