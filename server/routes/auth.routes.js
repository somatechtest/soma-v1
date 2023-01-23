const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const {body, validationResult} = require('express-validator')
const User = require("../models/user.model")
const Plan = require("../models/plan.model")
const Subscription = require("../models/subscription.model")
const CONSTANTS = require("../utils/utils")
const {signUpUser,loginUser} = require("../controllers/user.controller");
const { loginAuthTokenVerifyMiddleware } = require("../middleware/auth.middleware");


router.post("/signup", loginAuthTokenVerifyMiddleware, signUpUser);


router.post("/login", loginAuthTokenVerifyMiddleware, loginUser);


module.exports = router;