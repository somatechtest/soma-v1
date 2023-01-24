const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const middleware = require("../middleware/auth.middleware")
const bodyParser = require('body-parser')
const User = require("../models/userModel");
const { createCheckout, createBilling } = require("../controllers/payment.controller");
const productToPriceMap = {
    "PRO_MONTHLY": process.env.PRODUCT_PRO_MONTHLY,
    "PRO_ANNUALLY": process.env.PRODUCT_PRO_ANNUALLY,
    "ELITE_MONTHLY": process.env.PRODUCT_ELITE_MONTHLY,
    "ELITE_ANNUALLY": process.env.PRODUCT_ELITE_ANNUALLY,
}
const plansArray = ["PRO_MONTHLY", "PRO_ANNUALLY","ELITE_MONTHLY","ELITE_ANNUALLY"]

router.post('/checkout', middleware.authTokenVerifyMiddleware, createCheckout)


// router.use("/webhook", bodyParser.raw({ type: "application/json" }))
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))


router.get('/getSubscription',  middleware.authTokenVerifyMiddleware, getSelection);


router.get('/success', async (req, res) => {
  try{ 
    let customer = await Stripe.getCustomerFromBillingSession(req.query.session_id)
    res.json({
      errors:null,
      data:customer
    })
  }catch(error){
    res.json({
      errors:[
          {
              msg:error.message
          }
      ],
      data:null
    })
  }
    // console.log(".get('/success' customer ",customer)
    
    // res.send(`<html><body><h1>Thanks for your order, ${customer}!</h1></body></html>`);
});

router.post('/billing', middleware.authTokenVerifyMiddleware, createBilling)

router.post('/webhook', async (req, res) => {
    let event
  
    try {
      event = Stripe.createWebhook(req.body, req.header('stripe-signature'))
    } catch (err) {
      console.log(err)
      return res.sendStatus(400)
    }
  
    const data = event.data.object
  
    console.log("GOT EVENT ",event.type)  
    switch (event.type) {
        case 'customer.created':
          console.log("customer created",JSON.stringify(data.customer))
        break
        // case 'checkout.session.completed':{
        //   // Payment is successful and the subscription is created.
        //   // You should provision the subscription and save the customer ID to your database.

        //   const cuser = await User.findOne({"s_cid":data.customer})
      
  
        //   if (data.plan.id === process.env.PRODUCT_PRO) {
        //     console.log('Pro product bought')
        //     cuser.plan = 'pro'
        //     cuser.end_date = new Date(data.current_period_end * 1000)
        //   }
    
        //   if (data.plan.id === process.env.PRODUCT_BASIC) {
        //     console.log('Basic product bought')
        //     cuser.plan = 'basic'
        //     cuser.end_date = new Date(data.current_period_end * 1000)
        //   }
    
          
        //   // user.end_date = new Date(data.current_period_end * 1000)
    
        //   try{
        //       await cuser.save()
        //       console.log("new subscription of user ",cuser)
        //   }catch(error){
        //       console.log("error webhook ",error.message)
        //   }
        //   break;
        // }
          
        // case 'invoice.paid':{
          
        //   // Continue to provision the subscription as payments continue to be made.
        //   // Store the status in your database and check when a user accesses your service.
        //   // This approach helps you avoid hitting rate limits.

        //   // Payment is successful and the subscription is created.
        //   // You should provision the subscription and save the customer ID to your database.

        //   const cuser = await User.findOne({"s_cid":data.customer})
      
  
        //   if (data.plan.id === process.env.PRODUCT_PRO) {
        //     console.log('Pro product bought')
        //     cuser.plan = 'pro'
        //     cuser.end_date = new Date(data.current_period_end * 1000)
        //   }
    
        //   if (data.plan.id === process.env.PRODUCT_BASIC) {
        //     console.log('Basic product bought')
        //     cuser.plan = 'basic'
        //     cuser.end_date = new Date(data.current_period_end * 1000)
        //   }
    
          
        //   // user.end_date = new Date(data.current_period_end * 1000)
    
        //   try{
        //       await cuser.save()
        //       console.log("new subscription of user ",cuser)
        //   }catch(error){
        //       console.log("error webhook ",error.message)
        //   }
          
        //   break;
        // }
        // case 'invoice.payment_failed':{
          
        //   // The payment failed or the customer does not have a valid payment method.
        //   // The subscription becomes past_due. Notify your customer and send them to the
        //   // customer portal to update their payment information.

        //   //TODO: THINK WHAT TO BE MADE WHEN PAYMENT FAILS
        //   break;
        // }
      case 'customer.subscription.created': {
        console.log("GOT customer.subscription.created EVENT ",data)
        if(data.status==="paid"){
          
          const cuser = await User.findOne({"s_cid":data.customer})
          cuser.subs_id=data.id

          if (data.plan.id === process.env.PRODUCT_PRO_MONTHLY) {
            console.log('Pro monthly product bought')
            cuser.plan = 'pro'
            cuser.end_date = new Date(data.current_period_end * 1000)
          }
          if (data.plan.id === process.env.PRODUCT_PRO_ANNUALLY) {
            console.log('Pro yearly product bought')
            cuser.plan = 'pro'
            cuser.end_date = new Date(data.current_period_end * 1000)
          }
    
          if (data.plan.id === process.env.PRODUCT_ELITE_MONTHLY) {
            console.log('Elite product bought')
            cuser.plan = 'elite'
            cuser.end_date = new Date(data.current_period_end * 1000)
          }
          
          if (data.plan.id === process.env.PRODUCT_ELITE_ANNUALLY) {
            console.log('Elite product bought')
            cuser.plan = 'elite'
            cuser.end_date = new Date(data.current_period_end * 1000)
          }
    
          
          // user.end_date = new Date(data.current_period_end * 1000)
    
          try{
              await cuser.save()
              console.log("new subscription of user ",cuser)
          }catch(error){
              console.log("error webhook ",error.message)
          }
        }else{
          console.log("DB not updated as status is not paid : value ",data.status)
        }
  
        break
      }
      case 'customer.subscription.updated': {
        // started trial
        //THIS GETS CALLED EVEN ON SUCCESSFUL PAYMENT FROM CARD AUTOMATICALLY
        console.log("GOT customer.subscription.updated EVENT ",data)
        if (data.canceled_at) {
          // cancelled
          console.log('You just canceled the subscription' + data.canceled_at)
          
          //TODO: CHECK IF WE REALLY NEED A CANCELLED=T/F VARIABLE IN DB
          //COMMENTED BELOW 2 LINES BCOZ, WE ARE NOT REFUNDING THE AMOUNT AND PLAN RUNS TILL PLAN END DATE
          // cuser.plan = 'free'
          // cuser.end_date = null
        }
        
        if(data.status==="paid"){
          const cuser = await User.findOne({"s_cid":data.customer})
          cuser.subs_id=data.id
          console.log("USER WEB ",cuser)
  
        if (data.plan.id === process.env.PRODUCT_PRO_MONTHLY) {
          console.log('Pro monthly product bought')
          cuser.plan = 'pro'
          cuser.end_date = new Date(data.current_period_end * 1000)
        }
        if (data.plan.id === process.env.PRODUCT_PRO_ANNUALLY) {
          console.log('Pro yearly product bought')
          cuser.plan = 'pro'
          cuser.end_date = new Date(data.current_period_end * 1000)
        }
  

        if (data.plan.id === process.env.PRODUCT_ELITE_MONTHLY) {
          console.log('Elite monthly product bought')
          cuser.plan = 'elite'
          cuser.end_date = new Date(data.current_period_end * 1000)
        }
        
        if (data.plan.id === process.env.PRODUCT_ELITE_ANNUALLY) {
          console.log('Elite yearly product bought')
          cuser.plan = 'elite'
          cuser.end_date = new Date(data.current_period_end * 1000)
        }
  
  
        // const isOnTrial = data.status === 'trialing'
  
        // if (isOnTrial) {
        //   user.hasTrial = true
        //   user.end_date = new Date(data.current_period_end * 1000)
        // } else if (data.status === 'active') {
        //   user.hasTrial = false
        //   user.end_date = new Date(data.current_period_end * 1000)
        // }
  
        
        
  
        await cuser.save()
        console.log('customer changed', cuser)
        }else{
          console.log("DB not updated as status is not paid : value ",data.status)
        }
        break
      }
      // case "payment_intent.succeeded":{
      //   console.log(`PAID ${event.type}`, data)
      //   break
      // }
      case "invoice.paid":{
        console.log(`PAID ${event.type}`, data)
        try{
          let subsData = await Stripe.getSubscriptionFromSubscriptionID(data.subscription)
          console.log("SUBS DATA ",subsData)

          if(subsData.status==="active"){
            const cuser = await User.findOne({"s_cid":subsData.customer})
            cuser.subs_id=subsData.id
            console.log("USER WEB ",cuser)
    
          if (subsData.plan.id === process.env.PRODUCT_PRO_MONTHLY) {
            console.log('Pro monthly product bought')
            cuser.plan = 'pro'
            cuser.end_date = new Date(subsData.current_period_end * 1000)
          }
          if (subsData.plan.id === process.env.PRODUCT_PRO_ANNUALLY) {
            console.log('Pro yearly product bought')
            cuser.plan = 'pro'
            cuser.end_date = new Date(subsData.current_period_end * 1000)
          }
    
  
          if (subsData.plan.id === process.env.PRODUCT_ELITE_MONTHLY) {
            console.log('Elite monthly product bought')
            cuser.plan = 'elite'
            cuser.end_date = new Date(subsData.current_period_end * 1000)
          }
          
          if (subsData.plan.id === process.env.PRODUCT_ELITE_ANNUALLY) {
            console.log('Elite yearly product bought')
            cuser.plan = 'elite'
            cuser.end_date = new Date(subsData.current_period_end * 1000)
          }          
          await cuser.save()
          console.log("INVOICE PAID USER ",cuser)
        }
        }catch(error){
          console.log("error ",error.message)
        }
        break
      }
      case "invoice.payment_action_required":{
        console.log(`ACTION REQD ${event.type}`, data)
        break
      }
      case "invoice.payment_failed":{
        //TODO:called when auto subscription failed, handle this well
        console.log(`FAILED ${event.type}`, data)
        break
      }
      
      case "customer.subscription.deleted":{
        console.log(`DELETED ${event.type}`, data)
        break
      }
      default:
    }
    res.sendStatus(200)
  })
module.exports = router;