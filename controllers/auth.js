/**
 * Titan Ecommerce (Server)
 * controllers/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/12/2019 8:22 PM
 * @version 1.0
 */

const oUserModel = require("../models/user");
const oTokenModel = require("../models/emailToken");
const oJwt = require("jsonwebtoken");
const oExpressJwt = require("express-jwt");
const oCrypto = require("crypto");
const oNodeMailer = require("nodemailer");
const { setEmailOptions, getTransporter } = require("../library/EmailLibrary");
const { FRONT_DOMAIN } = require("../config");
const oFormidable = require("formidable");

const { errorHandler } = require("../helpers/dbErrorHandler");

/**
 * Request Body Image
 */
this.setRequestBodyImage = oRequest => {
  if (typeof oRequest.files !== "undefined") {
    Object.keys(oRequest.files).forEach(sKey => {
      oRequest.body[sKey] = oRequest.files[sKey][0].filename;
    });
  }
  return oRequest;
};

/**
 * Sign in user function
 */
exports.userSignin = (oRequest, oResponse) => {
  const { email, password } = oRequest.body;

  oUserModel.findOne({ email }, (err, oUser) => {
    if (!oUser) {
      return oResponse.status(400).json({
        error: "User with that email does not exist. Please sign up."
      });
    }

    if (!oUser.verified_email) {
      return oResponse.status(400).json({
        error: "Log-in not allowed, please verify email!",
        email: oUser.email
      });
    }

    if (!oUser.authenticatePassword(password)) {
      return oResponse
        .status(401)
        .json({ error: "Email and password dont match" });
    }

    const sToken = oJwt.sign({ _id: oUser._id }, process.env.JWT_SECRET);
    oResponse.cookie("t", sToken, { expire: new Date() + 9999 });

    oUser.hashed_password = undefined;
    oUser.salt = undefined;
    oUser.passwordResetToken = undefined;
    oUser.passwordResetExpires = undefined;
    oUser.passwordChangedAt = undefined;

    return oResponse.json({
      sToken,
      user: oUser
    });
  });
};

/**
 * User Sign-out function
 */
exports.userSignout = (oRequest, oResponse) => {
  oResponse.clearCookie("t");
  return oResponse.json({ message: "Signout Success!" });
};

/**
 * requireSignin middleware
 * this function will require API users Bearer Token header to execute request.
 */
exports.requireSignin = oExpressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth"
});

/**
 * checkAuth middleware
 * checks if there is a profile, auth token, and same id.
 */
exports.checkAuth = (oRequest, oResponse, oNext) => {
  let oUser =
    oRequest.profile &&
    oRequest.auth &&
    oRequest.profile._id == oRequest.auth._id;
  if (!oUser) {
    return oResponse.status(403).json({
      error: "Access Denied!"
    });
  }
  oNext();
};

/**
 * checkAdmin middleware
 * checks if user has a role of admin (admin = 1, others = 0)
 */
exports.checkAdmin = (oRequest, oResponse, oNext) => {
  if (oRequest.profile.role !== 1) {
    return oResponse.status(403).json({
      error: "Admin resource! Access Denied!"
    });
  }

  oNext();
};

/**
 * Create Verification Token
 */
this.createVerificationToken = async (oUserData, oResponse) => {
  // Create a verification token for this user
  const oToken = new oTokenModel({
    _userId: oUserData._id,
    email: oUserData.email,
    token: oCrypto.randomBytes(16).toString("hex")
  });

  // Save the verification token
  const oTokenData = await oToken.save();
  if (!oTokenData) {
    return oResponse.status(500).send({
      msg: oTokenData
    });
  }

  const oData = {
    email: oUserData.email,
    subject: "Titan Supertools Account Verification",
    text:
      "Hello,\n\n" +
      "Please verify your account by clicking the link: \n\n" +
      FRONT_DOMAIN +
      "/verify/" +
      oToken.token +
      ".\n",
    html: "",
    response: "A verification email has been sent to " + oUserData.email + "."
  };

  // Send the email
  oTransporter = getTransporter();
  oMailOptions = setEmailOptions(oData);
  const oMailData = await oTransporter.sendMail(oMailOptions);
  if (!oMailData) {
    return oResponse.status(500).send({
      error: oMailData
    });
  }
  return oResponse.status(200).send({
    message: "A verification email has been sent to " + oUserData.email + "."
  });
};

/**
 * Resend Verification Token
 */
exports.resendVerificationToken = (oRequest, oResponse) => {
  const { email } = oRequest.body;
  // Check if email exists
  oUserModel.findOne({ email }, (oError, oUserData) => {
    if (oUserData) {
      return this.createVerificationToken(oUserData, oResponse);
    }
    return oResponse.status(400).json({
      error: "Email not yet registered!"
    });
  });
};

/**
 * Register User and Send Validation Email
 */
this.saveRegisterUser = async (oRequest, oResponse) => {
  // Save the user
  const oUser = new oUserModel(oRequest.body);
  let oUserData;
  try {
    oUserData = await oUser.save();
  } catch (oError) {
    return oResponse.status(400).json({
      error: errorHandler(oError)
    });
  }

  return this.createVerificationToken(oUserData, oResponse);
};

/**
 * Register User and check if user exists
 */
exports.registerUser = (oRequest, oResponse) => {
  const { email } = oRequest.body;

  // Check if email exists
  oUserModel.findOne({ email }, (oError, oUserData) => {
    if (oUserData) {
      return oResponse.status(400).json({
        error: "Email already exists!"
      });
    }
    return this.saveRegisterUser(oRequest, oResponse);
  });
};

exports.forgotPassword = async (oRequest, oResponse) => {
  // get user based on posted email
  const oUser = await oUserModel.findOne({ email: oRequest.body.email });
  if (!oUser) {
    return oResponse.status(401).json({ error: "User not found" });
  }

  // then generate random token
  const sResetToken = oUser.createPasswordResetToken();
  const oUserResult = await oUser.save();
  if (!oUserResult) {
    return oResponse.status(401).json({ error: oUserResult });
  }

  // send it back to user email
  const resetURL = `${FRONT_DOMAIN}/resetPassword/${sResetToken}`;
  const oData = {
    email: oUser.email,
    subject: "Titan Supertools Password Reset",
    text: `Forgot your password Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didin't forget your password, please ignore this email.`,
    html: ""
  };

  // Send the email
  oTransporter = getTransporter();
  oMailOptions = setEmailOptions(oData);
  const oMailData = await oTransporter.sendMail(oMailOptions);
  if (!oMailData) {
    oUser.passwordResetToken = undefined;
    oUser.passwordResetExpires = undefined;
    await oUser.save({ validateBeforeSave: false });
    return oResponse.status(500).send({
      error: oMailData
    });
  }
  return oResponse.status(200).send({
    message: oUser.email
  });
};

exports.resetPassword = async (oRequest, oResponse) => {
  // get user based on the token
  const sHashedToken = oCrypto
    .createHash("sha256")
    .update(oRequest.params.tokenId)
    .digest("hex");
  const oUserData = await oUserModel.findOne({
    passwordResetToken: sHashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // if token has not expired and there is user then set the new password
  if (!oUserData) {
    return oResponse.status(401).send({
      error: "Password reset token is expired."
    });
  }
  oUserData.password = oRequest.body.password;
  oUserData.passwordResetExpires = undefined;
  oUserData.passwordResetToken = undefined;
  const oSavedData = await oUserData.save();
  if (!oSavedData) {
    return oResponse.status(401).send({
      error: "Unable to change password."
    });
  }
  return oResponse
    .status(200)
    .send({ message: "Successfully changed your password." });
  // log the user in, send JWT
};

/**
 * Account confirmation using token with expiration
 * and finding userId as reference
 */
exports.confirmUser = async (oRequest, oResponse) => {
  const oTokenData = await oTokenModel.findOne({
    token: oRequest.params.tokenId
  });
  if (!oTokenData) {
    return oResponse.status(400).send({
      type: "not-verified",
      msg: "We were unable to find a valid token. Your token may have expired."
    });
  }
  const oUserData = await oUserModel.findOne({
    _id: oTokenData._userId
  });
  if (!oUserData) {
    return oResponse.status(400).send({
      type: "not-verified",
      msg: "We were unable to find a valid token. Your token my have expired."
    });
  }
  if (oUserData.verified_email === true) {
    return oResponse.status(400).send({
      type: "already-verified",
      msg: "This user has already been verified."
    });
  }
  oUserData.verified_email = true;
  const oUpdatedData = oUserData.save();
  if (!oUpdatedData) {
    return oResponse.status(500).send({ msg: oUpdatedData });
  }
  return oResponse.status(200).send({
    type: "verified",
    msg: "The account has been verified. Please Log in."
  });
};
