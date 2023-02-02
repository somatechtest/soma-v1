const router = require("express").Router();
const admin = require("firebase-admin");
const {openai} = require("../connect/openai")
const CONSTANTS = require("../utils/utils")
const {body, validationResult} = require('express-validator')
const {authTokenVerifyMiddleware} = require("../middleware/auth.middleware")
const {planMiddleware} = require("../middleware/plans.middleware")
const User = require("../models/user.model");
const { tokenMiddleware, tokenTranslateMiddleware, tokenQuickPostMiddleware } = require("../middleware/tokens.middleware");
const { createCampaign } = require("../controllers/createCampaign.controller");
const { saveCampaign } = require("../controllers/saveCampaign.controller");
const { initCampaign, getCampaign, getAllCompletedCampaigns, updateCampaignName, deleteCampaign, getAllDraftCampaigns } = require("../controllers/campaignHelper.controller");
const { calculatePills } = require("../controllers/calculatePills.controller");
const { translateCampaign } = require("../controllers/translateCampaign.controller");
const { createQuickPost } = require("../controllers/quickPost.controller");



// router.post('/save', authTokenVerifyMiddleware, planMiddleware, tokenMiddleware, async function (req, res) {
//     //check if name exists
// })
router.post('/init', authTokenVerifyMiddleware,planMiddleware, initCampaign)
router.post('/update_campaign_name', authTokenVerifyMiddleware, updateCampaignName)
router.post('/save_campaign', authTokenVerifyMiddleware, saveCampaign)
router.post('/delete_campaign', authTokenVerifyMiddleware, deleteCampaign) 


router.get('/get_campaign', authTokenVerifyMiddleware, getCampaign)
router.get('/get_draft_campaigns', authTokenVerifyMiddleware, getAllDraftCampaigns)
router.get('/get_completed_campaigns', authTokenVerifyMiddleware, getAllCompletedCampaigns)

//TODO: ADD AUTH MIDDLEWARE BELOW  middleware.authTokenVerifyMiddleware,
router.post('/create', authTokenVerifyMiddleware, planMiddleware, tokenMiddleware, createCampaign)
router.post('/quick_post', authTokenVerifyMiddleware, planMiddleware, tokenQuickPostMiddleware, createQuickPost)
router.post('/regenerate', authTokenVerifyMiddleware, planMiddleware, tokenMiddleware, async function (req, res) {
    //to regenerate single post, with given tone or edited post
})

//TODO: DOUBLE CHECK IF CALCULATE PILLS ROUTER IS NEEDED?
router.get('/pill_calculator', calculatePills)
//TODO: ADD AUTH MIDDLEWARE BELOW  middleware.authTokenVerifyMiddleware,
router.post('/translate',  authTokenVerifyMiddleware, planMiddleware, tokenTranslateMiddleware, translateCampaign )

module.exports = router;




/***
 * /create body
 * {   
  "name": "Cocacola",
  "campaign_description":"campaign desc",
  "tones": ["formal", "funny"],
  "num_posts":3,
  "goal":"capaign goal",
  "product_name":"Cocacola",
  "product_description":"This is sweet and cold soft drink",
  "benefits":"benefits",
  "length":"short",
  "platform":"twitter"
}



/save body

{   
  "name": "Cocacola",
  "campaign_description":"campaign desc",
  "tones": ["formal", "funny"],
  "num_posts":3,
  "goal":"capaign goal",
  "product_name":"Cocacola",
  "product_description":"This is sweet and cold soft drink",
  "benefits":"benefits",
  "length":"short",

  "instagram":[],
  "facebook":[
      
  ],
  "twitter":[
      {
          "content": "A refreshing drink to enjoy any time of day!",
          "image": "twitter imgurl"
      },
      {
          "content": "This drink is perfect for a summer day!",
          "image": "twitter imgurl2"
      },
      {
          "content": "This drink is perfect for a winter day!",
          "image": "twitter imgurl3"
      }

  ],
  "linkedin":[]
}
 */