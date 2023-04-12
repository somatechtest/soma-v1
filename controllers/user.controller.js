/***
 * if verified give free plan
 * if not verified plan is none and tokensleft = null
 * 
 */

const admin = require("firebase-admin");
const Stripe = require("../connect/stripe")
const middleware = require("../middleware/auth.middleware")
const nodemailer = require("nodemailer")
const User = require("../models/user.model")
const Plan = require("../models/plan.model")
const Subscription = require("../models/subscription.model")
const CONSTANTS = require("../utils/utils")
const {StatusCodes} = require('http-status-codes')

function validateName(name,req,res){
    if(name.length>20 || name.length<4){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Name length breached"
                }
            ],
            data:null
        })
    }
}

function handleSendEmail(name, email) {
    // Not the movie transporter!
    console.log("PWD ",process.env.NODEMAILER_EMAIL_PWD)
    var transporter = nodemailer.createTransport({
     service: 'Gmail',
     auth: {
         user: process.env.NODEMAILER_EMAIL, 
         pass: process.env.NODEMAILER_EMAIL_PWD 
     }
    });
    var text = 'Hello from \n\n' + name;
    var mailOptions = {
        from: 'somatesttech@gmail.com', // sender address
        //to: req.email, // list of receivers
        to: email, // list of receivers
        subject: 'Welcome', // Subject line
        text: text,
        html: '<!DOCTYPE html>'+
        '<html><head><title>SOMA</title>'+
        '</head><body><div>'+
        '<img src="https://images.unsplash.com/photo-1600577916048-804c9191e36c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80" alt="" width="160">'+
        '<p>Thank you for joining us.</p>'+
        '</div></body></html>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.json({yo: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            res.json({yo: info.response});
        };
    });
}

async function createUserAndSubscriptionInDB(req,res,_name,_email,_uid,_s_cid,_emialVerified,_plan,_tokensLeft,_endDate){
    try{
        let user
        if(_s_cid!=null){
             user = await User.create({
                name:_name,
                email:_email,
                uid:_uid,
                s_cid:_s_cid,
                verified:_emialVerified
            })
        }else{
            user = await User.create({
                name:_name,
                email:_email,
                uid:_uid,
                verified:_emialVerified
            })
        }
        let userSubs = await Subscription.create({
            tokens_left: _tokensLeft, uid: _uid, end_date: _endDate,plan:_plan
        })

        return res.status(StatusCodes.OK).json({
            errors:null,
            data:{
                "user":{
                    name: user.name,
                    email: user.email,
                    verified : user.verified,
                    createdAt: user.createdAt

                },
                "subscription":{
                    tokens_left: userSubs.tokens_left,
                    end_date:userSubs.end_date,
                    top_up: userSubs.top_up,
                    plan:userSubs.plan,
                    status:userSubs.status
                }
            }
        })
    }catch(error){
        console.log(error.stack)
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

// call when login with google and normal login
async function loginUser(req,res){
    console.log("LOGGING IN")
    let mail = req.email;
    let uid = req.uid
    let emailVerified = req.isVerified
    let user = await User.findOne({"uid":uid})
    let temp=null;
    
    if(!user){
        if(emailVerified){
            
            //LOGGED IN WITH GOOGLE SO ADD TO DB COMPLETELY
            let customer = null
            let name = req.name
            console.log("CASE 1 (NAME)",name)
            
            
        let plan = await Plan.findOne({"plan":CONSTANTS.PLAN_FREE})
        let tokens = 0
        if(plan){
            tokens = plan.tokens
        }else{
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                errors:[
                    {
                        msg:"Free plan does not exist"
                    }
                ],
                data:null
            })
        }
        date = new Date()
        //adding 1 month
        date.setMonth(date.getMonth() + 1)
        plan = CONSTANTS.PLAN_FREE
        customer = await Stripe.addNewCustomer(mail,uid)
        handleSendEmail(name,req.email)
        await createUserAndSubscriptionInDB(req,res,name,mail,uid,customer.id,emailVerified,plan,tokens,date)

            
        }else{
            console.log("CASE 2")
            return res.status(StatusCodes.NOT_FOUND).json({
                errors:[
                    {
                        msg:"User does not exist please sign up"
                    }
                ],
                data:null
            })
        }
        
        
        
    }else{
        if(!emailVerified){
            console.log("CASE 3")
            return res.status(StatusCodes.FORBIDDEN).json({
                errors:[
                    {
                        msg:"Unverified email"
                    }
                ],
                data:null
            })
        }else{
            if(user.s_cid==null){
                console.log("CASE 5")
                let customerId
                try{
                    customerId = await Stripe.addNewCustomer(mail,uid)
                    handleSendEmail(req.name,req.email)
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
        
                let plan = await Plan.findOne({"plan":CONSTANTS.PLAN_FREE})
                let subs = await Subscription.findOne({"uid":uid})
                
                let tokens
                if(plan){
                    tokens = plan.tokens
                }else{
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        errors:[
                            {
                                msg:"Free plan does not exist"
                            },
                            {
                                msg:"something went wrong from server side"
                            }
                        ],
                        data:null
                    })
                }
                date = new Date()
                //adding 1 month
                date.setMonth(date.getMonth() + 1)
                plan = CONSTANTS.PLAN_FREE
                user.s_cid = customerId.id
                user.verified = emailVerified
                user.tokens_left = tokens
        
                //UPDATING SUBSCRIPTION
                subs.tokens_left = tokens
                subs.plan = plan
                subs.end_date = date
                subs.uid = uid
        
        
                try{
                    let saved = await user.save()
                    let subsSaved = await subs.save()
                    return res.status(StatusCodes.OK).json({
                        errors:null,
                        data:{
                            "user":{
                                name: saved.name,
                                email: saved.email,
                                verified : saved.verified,
                                createdAt: saved.createdAt
        
                            },
                            "subscription":{
                                tokens_left: subsSaved.tokens_left,
                                end_date:subsSaved.end_date,
                                top_up: subsSaved.top_up,
                                plan:subsSaved.plan,
                                status:subsSaved.status
                            }
                        }
                    })
                }catch(err){
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        errors:[
                            {
                                msg:err.message
                            }
                        ],
                        data:null
                    })
                }
            }else{
                console.log("CASE 4")
                let subs = await Subscription.findOne({"uid":uid})
                return res.status(StatusCodes.OK).json({
                    errors:null,
                    data:{
                        "user":{
                            name: user.name,
                            email: user.email,
                            verified : user.verified,
                            createdAt: user.createdAt
    
                        },
                        "subscription":{
                            tokens_left: subs.tokens_left,
                            end_date:subs.end_date,
                            top_up: subs.top_up,
                            plan:subs.plan,
                            status:subs.status
                        }
                    }
                })
            }
        }
        
    }
    
}


//called while signing up using email and pwd, creates plan as none 
async function signUpUser(req,res){
    console.log("SIGNING UP")
    let mail = req.email;
    let uid = req.uid
    let emailVerified = req.isVerified
    let name=null;
    
    if(!req.body.loginWithGoogle){
        name = req.body.name
        if(!name){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors:[
                    {
                        msg:"Parameter name missing"
                    }
                ],
                data:null
            })
        }
        validateName(name)
    }else{
        name = req.name
    }
    
    let user = await User.findOne({uid})
    if(user){
        return res.status(StatusCodes.CONFLICT).json({
            errors:[
                {
                    msg:"Email already used"
                }
            ],
            data:null
        })
    }
    if(name.length>20 || name.length<4){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Name length breached"
                }
            ],
            data:null
        })
    }
    let customerId = null
    //ADDIND CUSTOMER TO STRIPE AND GIVING HIM FREE PLAN ONLY IF HE IS VERIFIED 
    let date = null;
    let userPlan = "none"
    let tokens=0
   

    await createUserAndSubscriptionInDB(req,res,name,mail,uid,customerId,emailVerified,userPlan,tokens,date)
}

module.exports = {
    signUpUser,
    loginUser,
    handleSendEmail
}