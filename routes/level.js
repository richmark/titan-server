/**
 * Titan Ecommerce (Server)
 * routes/level.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

const oExpress = require("express");
const oRouter = oExpress.Router();

const { requireSignin, checkAuth, checkAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

const {
  createLevel,
  listLevel,
  levelById,
  getLevel,
  updateLevel,
  deleteLevel
} = require("../controllers/level");

oRouter.post(
  "/level/create/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  createLevel
);

oRouter.put(
  "/level/:levelId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  updateLevel
);

oRouter.delete(
  "/level/:levelId/:userId",
  requireSignin,
  checkAuth,
  checkAdmin,
  deleteLevel
);

oRouter.get("/level", listLevel);
oRouter.get("/level/:levelId", getLevel);

oRouter.param("userId", userById);
oRouter.param("levelId", levelById);

module.exports = oRouter;
