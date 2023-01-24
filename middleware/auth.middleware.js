
const admin = require("firebase-admin");
const {StatusCodes} = require('http-status-codes')

async function authTokenVerifyMiddleware(req,res,next){
    
    const tokenString = req.headers["authorization"] ? req.headers["authorization"].split(" "):null
    if(!tokenString){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors:[
                {
                    msg:"No header present"
                }
            ],
            data:null
        }) 
    }else if(!tokenString[1]){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors:[
                {
                    msg:"Bearer token missing"
                }
            ],
            data:null
        }) 
    }else{
        try{
            admin.auth().verifyIdToken(tokenString[1])
            .then((decodedToken)=>{
            const uid = decodedToken.uid
            admin.auth().getUser(uid)
                .then(userRecord => {
                    
                    req.email = userRecord.email
                    req.uid = uid
                    req.isVerified=userRecord.emailVerified
                    
                    req.name = userRecord.displayName
                    
                    next()
                })
                .catch(error => {
                    console.log("auth middleware error during fetching firebase user ",error.message)
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        errors:[
                            {
                                msg:error.message
                            }
                        ],
                        data:null
                    }) 
                })
             
            
            })
            .catch(error=>{
                console.log("auth middleware error while verifying firebase token ",error.message)
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    errors:[
                        {
                            msg:error.message
                        }
                    ],
                    data:null
                }) 
            })
        }catch(error){
            console.log("auth middleware error ",error.message)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errors:[
                    {
                        msg:error.message
                    }
                ],
                data:null
            })
        }
    }

}
async function loginAuthTokenVerifyMiddleware(req,res,next){
    const { loginWithGoogle } = req.body;
    if(loginWithGoogle==null){
        return res.status(StatusCodes.BAD_REQUEST).json({
            errors:[
                {
                    msg:"Missing loginWithGoogle param"
                }
            ],
            data:null
        })  
    }
    
    const tokenString = req.headers["authorization"] ? req.headers["authorization"].split(" "):null
    if(!tokenString){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors:[
                {
                    msg:"No header present"
                }
            ],
            data:null
        }) 
    }else if(!tokenString[1]){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            errors:[
                {
                    msg:"Bearer token missing"
                }
            ],
            data:null
        }) 
    }else{
        try{
            admin.auth().verifyIdToken(tokenString[1])
            .then((decodedToken)=>{
            const uid = decodedToken.uid
            admin.auth().getUser(uid)
                .then(userRecord => {
                    
                    req.email = userRecord.email
                    req.uid = uid
                    req.isVerified=userRecord.emailVerified
                    if(loginWithGoogle){
                        req.name = userRecord.displayName
                    }
                    next()
                })
                .catch(error => {
                    console.log("auth middleware error during fetching firebase user ",error.message)
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        errors:[
                            {
                                msg:error.message
                            }
                        ],
                        data:null
                    }) 
                })
             
            
            })
            .catch(error=>{
                console.log("auth middleware error while verifying firebase token ",error.message)
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    errors:[
                        {
                            msg:error.message
                        }
                    ],
                    data:null
                }) 
            })
        }catch(error){
            console.log("auth middleware error ",error.message)
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errors:[
                    {
                        msg:error.message
                    }
                ],
                data:null
            })
        }
    }

}
module.exports = {
    authTokenVerifyMiddleware,
    loginAuthTokenVerifyMiddleware
}
