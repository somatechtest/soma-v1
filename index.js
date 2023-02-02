const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser')
require('dotenv').config()
const StatusCodes = require("http-status-codes")

const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});


const userRouter = require("./routes/user.routes")
const planRouter = require("./routes/plans.routes")
const authRouter = require("./routes/auth.routes")
const payRouter = require("./routes/payment.routes")
const campaignRouter = require("./routes/campign.routes")
const adminRouter = require("./routes/admin.routes")
const brainstormRouter = require("./routes/brainstorm.routes")
var admin = require("firebase-admin");
// var serviceAccount = require("./firebasecreds.json");

var serviceAccount = 
  {
    "type": process.env.FIREBASE_type,
    "project_id": process.env.FIREBASE_project_id,
    "private_key_id": process.env.FIREBASE_private_key_id,
    "private_key": process.env.FIREBASE_private_key.replace(/\\n/gm, "\n"),
    "client_email": process.env.FIREBASE_client_email,
    "client_id": process.env.FIREBASE_client_id,
    "auth_uri": process.env.FIREBASE_auth_uri,
    "token_uri": process.env.FIREBASE_token_uri,
    "auth_provider_x509_cert_url": process.env.FIREBASE_auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.FIREBASE_client_x509_cert_url
  }
  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
app.use("/api/v1/payment/webhook", bodyParser.raw({ type: "application/json" }))
app.use(cors(), express.json());

// app.get("/", (req, res) =>
//   res.json({ success: true, message: "server is running!" })
// );

app.use("/api/v1/", userRouter);
app.use("/api/v1/", planRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/payment", payRouter);
app.use("/api/v1/campaign", campaignRouter);
//TODO: REMOVE ADMIN ROUTE IF NOT REQUIRED
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/", brainstormRouter);
app.use("/api/v1/_health/",(req,res)=>{
  res.status(StatusCodes.OK).json({
    data:"OK"
  })
})


module.exports = app;