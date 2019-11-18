/**
 * Titan Ecommerce (Server)
 * controllers/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:22 PM
 * @version 1.0
 */

const oUserModel = require('../models/user');
const oTokenModel = require('../models/emailToken');
const oJwt = require('jsonwebtoken');
const oExpressJwt = require('express-jwt');
const oCrypto = require('crypto');
const oNodeMailer = require('nodemailer');
const oFormidable = require('formidable');


/**
 * Set Token Email
 */
this.setTokenEmail = (oUserData, oRequest, oResponse) => {
  // Create a verification token for this user
  const oToken = new oTokenModel({
    _userId: oUserData._id,
    token: oCrypto.randomBytes(16).toString("hex")
  });

  // Save the verification token
  oToken.save(oSaveTokenError => {
    if (oSaveTokenError) {
      return oResponse.status(500).send({
        msg: oSaveTokenError.message
      });
    }

    // Send the email
    const oTransporter = oNodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const oMailOptions = {
      from: "no-reply@barzoicompany.com",
      to: oUserData.email,
      subject: "Account Verification Token",
      text:
        "Hello,\n\n" +
        "Please verify your account by clicking the link: \nhttp://" +
        oRequest.headers.host +
        "/api/confirmation/" +
        oToken.token +
        ".\n"
    };
    oTransporter.sendMail(oMailOptions, oError => {
      if (oError) {
        return oResponse.status(500).send({
          msg: oError.message
        });
      }
      return oResponse
        .status(200)
        .send("A verification email has been sent to " + oUserData.email + ".");
    });
  });
};


/**
 * Request Body Image
 */
this.setRequestBodyImage = (oRequest) => {
    Object.keys(oRequest.files).forEach((sKey) => {
        oRequest.body[sKey] = oRequest.files[sKey][0].filename;
    });
    return oRequest;
};

/**
 * Register User and Send Validation Email
 */
exports.registerUser = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    const oUser = new oUserModel(oRequest.body);
    oUser.save((oError, oUserData) => {
        if (oError) {
            return oResponse.status(400).json({
                error : oError 
            });
        }
        return this.setTokenEmail(oUserData, oRequest, oResponse);
  });
};

/**
 * Sign in user function
 */
exports.userSignin = (oRequest, oResponse) => {
  const { email, password } = oRequest.body;

  oUserModel.findOne({ email }, (err, user) => {
    if (!user) {
      return oResponse.status(400).json({
        error: "User with that email does not exist. Please sign up."
      });
    }

    if (!user.verified_email) {
      return oResponse.status(400).json({
        error: "Log-in not allowed, please verify email!"
      });
    }

    if (!user.authenticatePassword(password)) {
      return oResponse
        .status(401)
        .json({ error: "Email and password dont match" });
    }

    const sToken = oJwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    oResponse.cookie("t", sToken, { expire: new Date() + 9999 });

    const { _id, first_name, last_name, email, role } = user;
    return oResponse.json({
      sToken,
      user: { _id, first_name, last_name, email, role }
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
exports.checkAuth = (oRequest, oResponse, next) => {
  let user =
    oRequest.profile &&
    oRequest.auth &&
    oRequest.profile._id == oRequest.auth._id;

  if (!user) {
    return oResponse.status(403).json({
      error: "Access Denied!"
    });
  }
  next();
};

/**
 * checkAdmin middleware
 * checks if user has a role of admin (admin = 1, others = 0)
 */
exports.checkAdmin = (oRequest, oResponse, next) => {
  if (oRequest.profile.role === 0) {
    return oResponse.status(403).json({
      error: "Admin resource! Access Denied!"
    });
  }

  next();
};
