const router = require("express").Router();
const { getBrainstormOpenaiResponse } = require("../controllers/getBrainstormOpenaiResponse.controller");
const { loginAuthTokenVerifyMiddleware, authTokenVerifyMiddleware } = require("../middleware/auth.middleware");
const { planMiddleware } = require("../middleware/plans.middleware");
const { tokenBrainstormMiddleware } = require("../middleware/tokens.middleware");


router.post("/brainstorm", authTokenVerifyMiddleware, planMiddleware, tokenBrainstormMiddleware, getBrainstormOpenaiResponse);

module.exports = router;