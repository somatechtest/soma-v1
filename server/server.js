require("dotenv").config();
const app = require("./index");
const mongoose = require("mongoose");

// Establishing database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Soma',
  })
  .then(() => {
    console.log("DB connection successful!")
    app.listen(9000, () => console.log("server is runnning at port 9000!"));
  })
  .catch((err) => console.log("Error connecting DB!", err.message));

