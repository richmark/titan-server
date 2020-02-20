/**
 * Titan Ecommerce (Server)
 * routes/shipper.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 12/06/2019
 * @version 1.0
 */

const oExpress = require('express');
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { listShippers, createShipper, shipperById, getShipperById, updateShipper, deleteShipper } = require('../controllers/shipper');

oRouter.post('/shipper/create/:userId', requireSignin, checkAuth, checkAdmin, createShipper);
oRouter.put('/shippers/:userId/:shipperId', requireSignin, checkAuth, checkAdmin, updateShipper);
oRouter.get('/shippers/:userId', requireSignin, checkAuth, checkAdmin, listShippers);
oRouter.get('/shippers/:userId/:shipperId', requireSignin, checkAuth, checkAdmin, getShipperById);
oRouter.delete(
    "/shippers/delete/:userId",
    requireSignin,
    checkAuth,
    checkAdmin,
    deleteShipper
);

oRouter.param('userId', userById);
oRouter.param('shipperId', shipperById);

module.exports = oRouter;