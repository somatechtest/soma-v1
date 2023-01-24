const router = require("express").Router();
const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const middleware = require("../middleware/auth.middleware")
const bodyParser = require('body-parser')
const CONSTANTS = require('../utils/utils')
const User = require("../models/user.model");
const Subscription = require("../models/subscription.model");
const Plan = require("../models/plan.model");
const Payment = require("../models/payments.model");
const { plansArray, productToPriceMap, planToDBTerminology } = require("../utils/utils");
const { StatusCodes } = require("http-status-codes");

//TODO: HAVE SUPPORT FOR BUYING PILLS BY INTRODUCING A NEW STRIPE PRODUCT

//TOD: USE PAGE AND LIMIT FOR THIS OR ELSE MAY TURN OUT TO BE HUGE DOC
const getPaymetLogs = async(req,res)=>{
  let user = User.findOne({uid:req.uid})
  let customerId=null;
    const cuser = await User.findOne({"uid":req.uid})
    if(!cuser){
        return res.json({
            errors:[
                {
                    msg:"User not found"
                }
            ],
            data:null
        })
    }else{
        customerId = cuser.s_cid
        //TODO: FOR NOW GETTING ONLY 5 INVOICES, PLAN FOR FUTURE IS PAGINATION
        const paymentIntents = await Stripe.Stripe.paymentIntents.list({
          limit: 5,
          customer: customerId
        });
        //amount, currency, created_at, name, desc, status, plan, duration, paid?
        return res.status(StatusCodes.OK).json({
          paymentIntents
        })




        let logs = await Payment.find({s_cid:customerId})
        // if(!logs){
        //   res.json({
        //       errors:[
        //           {
        //               msg:"No logs found"
        //           }
        //       ],
        //       data:null
        //   })
        // }else{
        //   res.json({
        //     errors:null,
        //     data:{
        //       "logs":logs
        //     }
        // })
        // }
    }
  

}

const updatePaymentLog = async(data,_status)=>{
  //TODO: REPLACE THIS WITH https://stackoverflow.com/questions/64931667/how-to-retrieve-a-customers-payment-history-with-stripe#:~:text=You%20would%20use%20the%20List,payments%20that%20the%20customer%20made.
  let payObj = new Payment({s_cid:data.customer, subscription:data.subscription, status: _status})
        try{
          let res = await payObj.save()
          console.log("Saved failed payment details to db ",res)
        }catch(error){
          console.log("Error while adding failed payment to db ", error.message)
        }
}

const createCheckout = async (req, res) => {
    const { product } = req.body
    let customerId=null;
    const cuser = await User.findOne({"uid":req.uid})
    if(!cuser){
        return res.status(StatusCodes.NOT_FOUND).json({
            errors:[
                {
                    msg:"User not found"
                }
            ],
            data:null
        })
    }else{
        customerId = cuser.s_cid
    }
    if(!product){
      return res.status(StatusCodes.BAD_REQUEST).json({
        errors:[
            {
                msg:"Invalid plan"
            }
        ],
        data:null
    })
    }
    if(!plansArray.includes(product.toUpperCase())){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Invalid plan"
                }
            ],
            data:null
        })
    }
  
    const price = productToPriceMap[product.toUpperCase()]
    try{
      const session = await Stripe.createCheckoutSession(customerId, price)
      return res.status(StatusCodes.OK).json({
        errors:null,
        data:{
          "session_url":session.url
        }
      })
    }catch(error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        errors:[
            {
                msg:error.message
            }
        ],
        data:null
      })
    }
  
    
    
}
const getSubscription = async (req, res) => {
    let subsId=null;
    try{ 
      const cuser = await User.findOne({"email":req.email})
      if(!cuser){
          return res.status(StatusCodes.NOT_FOUND).json({
              errors:[
                  {
                      msg:"User not found"
                  }
              ],
              data:null
          })
      }else{
        subsId = cuser.subs_id
      }
  
      let subs = await Stripe.getSubscriptionFromSubscriptionID(subsId)
      return res.status(StatusCodes.OK).json({
        errors:null,
        data:{
          "subscription":subs
        }
      })
    }catch(error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  }

  const getSubscriptionFromID = async (req, res) => {
    let subsId=req.query.id;
    try{ 
  
      let subs = await Stripe.getSubscriptionFromSubscriptionID(subsId)
      return res.status(StatusCodes.OK).json({
        errors:null,
        data:{
          "subscription":subs
        }
      })
    }catch(error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  }

  const createBilling = async (req, res) => {
    let customerId=null;
    const cuser = await User.findOne({"uid":req.uid})
    if(!cuser){
        return res.status(StatusCodes.NOT_FOUND).json({
            errors:[
                {
                    msg:"User not found"
                }
            ],
            data:null
        })
    }else{
        customerId = cuser.s_cid
    }
    try{
      const session = await Stripe.createBillingSession(customerId)
      return res.status(StatusCodes.OK).json({
        errors:null,
        data:{
          "session url":session.url
        }
      })
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

const paymentSuccess = async (req, res) => {
    try{ 
      let customer = await Stripe.getCustomerFromBillingSession(req.query.session_id)
      return res.status(StatusCodes.OK).json({
        errors:null,
        data:{
          "customer":customer
        }
      })
    }catch(error){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
}



const updateUserPlan = async(data)=>{
    const cuser = await User.findOne({"s_cid":data.customer})
    cuser.subs_id=data.id

    const userSubs = await Subscription.findOne({"uid":cuser.uid})
    if(!userSubs){
      console.log("User subscription not found for uid ",cuser.uid)
        //TODO: MAKE SURE THIS DATA IS ALWAYS THERE
    }
    

    //TODO: FINALIZE ON A CASE WHEN THE USER UPDATES PLAN WITH TOKENS AND DURATION LEFT FROM PREVIOUS PLAN
    const today = new Date();

    //update plans and subscriptions below

    if (data.plan.id === process.env.PRODUCT_PRO_MONTHLY) {

      console.log('Pro monthly product bought')
      let dbPlan = planToDBTerminology["PRO_MONTHLY"]
      
      const planData = await Plan.findOne({"plan":dbPlan})
      
      userSubs.tokens_left = planData.tokens
      userSubs.end_date = new Date(data.current_period_end * 1000)
      userSubs.plan = dbPlan
    }
    if (data.plan.id === process.env.PRODUCT_PRO_ANNUALLY) {
      console.log('Pro yearly product bought')
      let dbPlan = planToDBTerminology["PRO_ANNUALLY"]
      const planData = await Plan.findOne({"plan":dbPlan})
      
      userSubs.tokens_left = planData.tokens
      userSubs.end_date = new Date(data.current_period_end * 1000)
      userSubs.plan = dbPlan
    }

    if (data.plan.id === process.env.PRODUCT_ELITE_MONTHLY) {
      console.log('Elite monthly product bought')
      let dbPlan = planToDBTerminology["ELITE_MONTHLY"]
     
      const planData = await Plan.findOne({"plan":dbPlan})
      
      userSubs.tokens_left = planData.tokens
      userSubs.end_date = new Date(data.current_period_end * 1000)
      userSubs.plan = dbPlan
    }
    
    if (data.plan.id === process.env.PRODUCT_ELITE_ANNUALLY) {
      console.log('Elite yearly product bought')
      let dbPlan = planToDBTerminology["ELITE_ANNUALLY"]
      
      const planData = await Plan.findOne({"plan":dbPlan})
      
      userSubs.tokens_left = planData.tokens
      userSubs.end_date = new Date(data.current_period_end * 1000)
      userSubs.plan = dbPlan
    }
    // user.end_date = new Date(data.current_period_end * 1000)

    try{
        await cuser.save()
        await userSubs.save()
        console.log("user just bought a subscription ",cuser)
    }catch(error){
        console.log("error webhook ",error.message)
    }
}

const handleStripeWebhook = async (req, res) => {
    let event
  
    try {
      event = Stripe.createWebhook(req.body, req.header('stripe-signature'))
    } catch (err) {
      console.log(err)
      return res.sendStatus(400)
    }
  
    const data = event.data.object
  
    console.log("received stripe event  ",event.type)  
    switch (event.type) {
      case 'customer.created':
        console.log("customer created",JSON.stringify(data.customer))
      break 
      case 'checkout.session.completed':
          console.log("checkout session completed ",JSON.stringify(data.customer))
        break  
      case 'customer.subscription.created': {
        console.log("GOT customer.subscription.created EVENT ",data)
        if(data.status==="paid"){
          updateUserPlan(data)
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
          //TODO: CHECK IF REALLY CANCELLED, IF CANCELLED, CHECK IF PLAN END DATE HAS APPEARED, IF YES SET PLAN DETAILS AS FREE PLAN
          
          //TODO: CHECK IF WE REALLY NEED A CANCELLED=T/F VARIABLE IN DB
          //COMMENTED BELOW 2 LINES BCOZ, WE ARE NOT REFUNDING THE AMOUNT AND PLAN RUNS TILL PLAN END DATE
          // cuser.plan = 'free'
          // cuser.end_date = null
        }
        
        if(data.status==="paid"){
          updateUserPlan(data)
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
            updateUserPlan(subsData)
          }
          //TODO: IF STATUS==NOT ACTIVE , WE MA CANCEL SUBSCRIPTION AND ADD FREE PLAN FOR HIM
        }catch(error){
          console.log("error ",error.message)
        }
        // await updatePaymentLog(data,CONSTANTS.STATUS_PAID)
        break
      }
      case "invoice.payment_action_required":{
        console.log(`ACTION REQD ${event.type}`, data)
        // await updatePaymentLog(data, CONSTANTS.STATUS_PAYMENT_ACTION_REQUIRED)
        break
      }
      case "invoice.payment_failed":{
        //TODO:called when auto subscription failed, handle this well
        //TODO: CURRENTLY THIS IS ALSO BEING CALLED AS SOON AS SOMEONE ATTEMPTS TO PAY USING 3DS, HANDLE THIS
        console.log(`FAILED ${event.type}`, data)
        // await updatePaymentLog(data,CONSTANTS.STATUS_FAILED)
        break
      }
      
      case "customer.subscription.deleted":{
        console.log(`DELETED ${event.type}`, data)
        //TODO: this may be called when subscription ends
        break
      }
      default:
    }
    res.sendStatus(200)
  }

module.exports = {
    createCheckout,
    getSubscription,
    createBilling,
    handleStripeWebhook,
    paymentSuccess,
    getSubscriptionFromID,
    getPaymetLogs
}
