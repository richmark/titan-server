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
const { getTransporter, setEmailOptionsBackUpDB } = require("./library/EmailLibrary");

require("dotenv").config();

/**
 * Routes
 */
const oAuthRoutes = require("./routes/auth");
const oUserRoutes = require("./routes/user");
const oCategoryRoutes = require("./routes/category");
const oProductRoutes = require("./routes/product");
const oShipperRoutes = require("./routes/shipper");
const oOrderRoutes = require("./routes/order");
const oCouponRoutes = require("./routes/coupon");
const oReviewRoutes = require("./routes/review");
const oBundleRoutes = require("./routes/bundles");
const oBrainTreeRoutes = require("./routes/braintree");
const oPaymayaRoutes = require("./routes/paymaya");
const oBannerRoutes = require("./routes/banner");
const oLevelRoutes = require("./routes/level");
const oSideBannerRoutes = require("./routes/sidebanner");

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
    useFindAndModify: false,
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
oApp.use(oBodyParser.urlencoded({ extended: true }));
oApp.use(oBodyParser.json());
oApp.use(oExpress.static(oPath.resolve("./public")));

/**
 * Middlewares (routes)
 */
oApp.use("/api/v1", oAuthRoutes);
oApp.use("/api/v1", oUserRoutes);
oApp.use("/api/v1", oCategoryRoutes);
oApp.use("/api/v1", oProductRoutes);
oApp.use("/api/v1", oShipperRoutes);
oApp.use("/api/v1", oOrderRoutes);
oApp.use("/api/v1", oBrainTreeRoutes);
oApp.use("/api/v1", oReviewRoutes);
oApp.use("/api/v1", oPaymayaRoutes);
oApp.use("/api/v1", oCouponRoutes);
oApp.use("/api/v1", oBundleRoutes);
oApp.use("/api/v1", oBannerRoutes);
oApp.use("/api/v1", oLevelRoutes);
oApp.use("/api/v1", oSideBannerRoutes);

/**
 * Default port 8000
 * Port status
 */
const iPort = process.env.PORT || 8000;
oApp.listen(iPort, () => {
  console.log(`Server is running on port ${iPort}`);
});

const { spawn } = require('child_process');
const path = require('path');

const DB_NAME = 'titan-server';
const ARCHIVE_PATH = path.join(path.dirname(require.main.filename), 'public', `${DB_NAME}.gz`);

const cron = require('node-cron');
cron.schedule('0 12 * * *', () => this.backupServer()); // daily at 12 am

this.backupServer = function () {
	const child = spawn('mongodump', [
	  `--db=${DB_NAME}`,
	  `--archive=${ARCHIVE_PATH}`,
	  `--gzip`
	])
  
	child.stdout.on('data', (data) => {
	  console.log('stdout:\n', data);
	})
	child.stderr.on('data', (data) => {
	  console.log('stderr:\n', Buffer.from(data).toString());
	})
	child.on('error', (data) => {
	  console.log('error:\n', data);
	})
	child.on('exit', (data, signal) => {
	  if (data) {
		console.log('Process exit with code:', data);
	  }
	  else if (signal) {
		console.log('Process killed with signal:', signal);
	  } else {
		console.log('Backup is successful');
		this.sendEmailWithAttachment();
	  }
	})
};
  
this.restoreServer = function () {
	const child = spawn('mongorestore', [
	  `--db=${DB_NAME}`,
	  `--archive=${ARCHIVE_PATH}`,
	  `--gzip`
	])
  
	child.stdout.on('data', (data) => {
	  console.log('stdout:\n', data);
	})
	child.stderr.on('data', (data) => {
	  console.log('stderr:\n', Buffer.from(data).toString());
	})
	child.on('error', (data) => {
	  console.log('error:\n', data);
	})
	child.on('exit', (data, signal) => {
	  if (data) {
		console.log('Process exit with code:', data);
	  }
	  else if (signal) {
		console.log('Process killed with signal:', signal);
	  } else {
		console.log('Restore is successful');
	  }
	})
};
  
this.sendEmailWithAttachment = async () => {
	oTransporter = getTransporter();
	oMailOptions = setEmailOptionsBackUpDB(
    `${process.env.EMAIL_USERNAME}`, 'Titan Supertools DB Backup', 'Sucessful Backup please see zipped file', ARCHIVE_PATH, DB_NAME
  );
	const oMailData = await oTransporter.sendMail(oMailOptions);
	if (!oMailData) {
	  console.log(oMailData);
	}
	console.log(`Backup file has been sent to ${process.env.EMAIL_USERNAME}`)
};

// this.backupServer();
// this.restoreServer();
