const TWITTER = "twitter"
const INSTAGRAM = "instagram"
const LINKEDIN = "linkedin"
const FACEBOOK = "facebook"
const SUPPORTED_PLATFORMS = [TWITTER,INSTAGRAM,LINKEDIN,FACEBOOK]
const SUPPORTED_TONES = ["friendly","professional","funny","luxurious","bold","adventurous","empathetic","convincing","optimistic","smart","helpful","formal","bullish"]
const CAPMAIGN_STATES_ARRAY = ["completed","draft"]
const MAX_TONES_SUPPORTED = 3
const MAX_NUM_POSTS = 30
const MODEL_DAVINCI = "text-davinci-003"
const MODEL_CURIE = "text-curie-001"
const MODEL_BABBAGE = "text-babbage-001"
const MODEL_ADA = "text-ada-001"
const SUPPORTED_LANGUAGES = ["spanish","french","japanese","hindi"]
const PLAN_FREE = "free"
const PLAN_PRO_MONTHLY = "pro_m"
const PLAN_PRO_ANNUALLY = "pro_m"
const PLAN_ELITE_MONTHLY = "elite_m"
const PLAN_ELITE_ANNUALLY = "elite_a"
const PLAN_NONE = "none"
const STATUS_PAID = "P"
const STATUS_PAYMENT_ACTION_REQUIRED = "PAR"
const STATUS_FAILED = "F"
LENGTH_SHORT = "short"
LENGTH_LONG = "long"
LENGTH_OPTIMUM = "optimum"

const STATUS_NONE = "none"
const STATUS_ACTIVE = "active"
const productToPriceMap = {
    "PRO_MONTHLY": process.env.PRODUCT_PRO_MONTHLY,
    "PRO_ANNUALLY": process.env.PRODUCT_PRO_ANNUALLY,
    "ELITE_MONTHLY": process.env.PRODUCT_ELITE_MONTHLY,
    "ELITE_ANNUALLY": process.env.PRODUCT_ELITE_ANNUALLY,
}

const planToDBTerminology = {
    "PRO_MONTHLY": "pro_m",
    "PRO_ANNUALLY": "pro_a",
    "ELITE_MONTHLY": "elite_m",
    "ELITE_ANNUALLY": "elite_a",
}



const plansArray = ["PRO_MONTHLY", "PRO_ANNUALLY","ELITE_MONTHLY","ELITE_ANNUALLY"]
const topupArray = ["TOPUP_1", "TOPUP_2", "TOPUP_3"] //2$ 5$ 10$

const topupToPriceMap = {
    "TOPUP_1": process.env.PRODUCT_UPGRADE_1,
    "TOPUP_2": process.env.PRODUCT_UPGRADE_2,
    "TOPUP_3": process.env.PRODUCT_UPGRADE_3,
}

const topupToDBTerminology = {
    "TOPUP_1": "topup_1",
    "TOPUP_2": "topup_2",
    "TOPUP_3": "topup_3"
}


const POST_LENGTH_ARRAY = [LENGTH_SHORT,LENGTH_OPTIMUM,LENGTH_LONG]

const TOKENS_PER_IMAGE = 2;
const TOKENS_PER_VIDEO = 5;

module.exports = {
    SUPPORTED_PLATFORMS,
    SUPPORTED_TONES,
    TWITTER,
    INSTAGRAM,
    LINKEDIN,
    FACEBOOK,
    MAX_TONES_SUPPORTED,
    MAX_NUM_POSTS,
    MODEL_DAVINCI,
    MODEL_CURIE,
    MODEL_BABBAGE,
    MODEL_ADA,
    SUPPORTED_LANGUAGES,
    PLAN_FREE,
    PLAN_PRO_MONTHLY,
    PLAN_PRO_ANNUALLY,
    PLAN_ELITE_MONTHLY,
    PLAN_ELITE_ANNUALLY,
    PLAN_NONE,
    productToPriceMap,
    planToDBTerminology,
    plansArray,
    topupArray,
    topupToPriceMap,
    topupToDBTerminology,
    STATUS_PAID,
    STATUS_PAYMENT_ACTION_REQUIRED,
    STATUS_FAILED,
    STATUS_NONE,
    STATUS_ACTIVE,
    LENGTH_SHORT,
    LENGTH_LONG,
    LENGTH_OPTIMUM,
    POST_LENGTH_ARRAY,
    CAPMAIGN_STATES_ARRAY,
    TOKENS_PER_IMAGE,
    TOKENS_PER_VIDEO
}