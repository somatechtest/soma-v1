const router = require("express").Router();
const Plan = require("../models/plan.model")
//TODO: IMPLEMENT A TIGHT SECURITY CHECK ON THIS ROUTE / REMOVE THIS
router.post('/createplan', async function (req, res) {
    const {plan,tokens,translate,max_posts_once,allow_download,stripe_price_id,max_platforms} = req.body
    if(!plan||!tokens||!translate||!max_posts_once||!allow_download||!stripe_price_id||!max_platforms){
         return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[{
                msg:"required parameter missing"
            }],
            data:null
        })
    }
    //TODO: IMPLEMENT PARAMETER CHECK
    let temp = await Plan.create({
        plan,
        tokens,
        translate,
        max_posts_once,
        allow_download,
        stripe_price_id,
        max_platforms
    })
    res.json({
        errors:null,
        data:temp
    })
})


module.exports = router;