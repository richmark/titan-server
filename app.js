/**
 * Titan Ecommerce (Server)
 * App.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/12/2019 8:00 PM
 * @version 1.0
 */

const oExpress = require("express");
const oMongoose = require("mongoose");
const oBodyParser = require("body-parser");
const oPath = require("path");
const oCors = require("cors");
const oExpressValidator = require("express-validator");

require("dotenv").config();

/**
 * Routes
 */
const oAuthRoutes = require("./routes/auth");
const oUserRoutes = require("./routes/user");
const oCategoryRoutes = require("./routes/category");
const oProductRoutes = require("./routes/product");

/**
 * App Instance
 */
const oApp = oExpress();
/**
 * MongoDB Connection
 */
oMongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("DB Connected"));

/**
 * Allow Cross-Origin Resource Sharing
 */
oApp.use(oCors());

/**
 * Middlewares
 */
oApp.use(oBodyParser.json());
oApp.use(oExpress.static(oPath.resolve("./public")));

/**
 * Middlewares (routes)
 */
oApp.use("/api/v1", oAuthRoutes);
oApp.use("/api/v1", oUserRoutes);
oApp.use("/api/v1", oCategoryRoutes);
oApp.use("/api/v1", oProductRoutes);

/**
 * Default port 8000
 * Port status
 */
const iPort = process.env.PORT || 8000;
oApp.listen(iPort, () => {
  console.log(`Server is running on port ${iPort}`);
});
