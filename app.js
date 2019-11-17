/**
 * Titan Ecommerce (Server)
 * App.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:00 PM
 * @version 1.0
 */

const oExpress = require('express');
const oMongoose = require('mongoose');
const oBodyParser = require('body-parser');
const oCors = require('cors');
const oExpressValidator = require('express-validator');

require('dotenv').config();

/**
 * Routes
 */
const oAuthRoutes = require('./routes/auth');

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
	.then(() => console.log('DB Connected'));

/**
 * Allow Cross-Origin Resource Sharing
 */
oApp.use(oCors());

/**
 * Middlewares
 */
oApp.use(oBodyParser.json());

/**
 * Middlewares (routes)
 */
oApp.use('/api/v1', oAuthRoutes);

/**
 * Default port 8000
 * Port status
 */
const iPort = process.env.PORT || 8000;
oApp.listen(iPort, () => {
	console.log(`Server is running on port ${iPort}`);
});
