const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const {body, validationResult} = require('express-validator')
const User = require("../models/user.model")
const Plan = require("../models/plan.model")
const Subscription = require("../models/subscription.model")

const { getPlan } = require("../controllers/plans.controller");


router.get("/get_plan", getPlan);



module.exports = router