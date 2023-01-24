const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const middleware = require("../middleware/auth.middleware")
const bodyParser = require('body-parser')
const User = require("../models/user.model");
const { createCheckout, createTopupCheckout, createBilling, handleStripeWebhook, getSubscription, paymentSuccess, getSubscriptionFromID, getPaymetLogs } = require("../controllers/payment.controller");


router.post('/checkout', middleware.authTokenVerifyMiddleware, createCheckout)
router.post('/topup_checkout', middleware.authTokenVerifyMiddleware, createTopupCheckout)


// router.use("/webhook", bodyParser.raw({ type: "application/json" }))
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))


router.get('/get_user_subscription',  middleware.authTokenVerifyMiddleware, getSubscription);
router.get('/get_subscription',  middleware.authTokenVerifyMiddleware, getSubscriptionFromID)


router.get('/success', paymentSuccess);

router.post('/manage_subscriptions', middleware.authTokenVerifyMiddleware, createBilling)

router.post('/webhook', handleStripeWebhook)
module.exports = router;