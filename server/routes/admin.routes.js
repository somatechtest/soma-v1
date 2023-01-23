const router = require("express").Router();
const Plan = require("../models/plan.model")
//TODO: IMPLEMENT A TIGHT SECURITY CHECK ON THIS ROUTE
router.post('/createplan', async function (req, res) {
    const {plan,tokens,translate,max_posts_once,allow_download,stripe_price_id} = req.body
    //TODO: IMPLEMENT PARAMETER CHECK
    let temp = await Plan.create({
        plan,
        tokens,
        translate,
        max_posts_once,
        allow_download,
        stripe_price_id
    })
    res.json({
        errors:null,
        data:temp
    })
})


module.exports = router;