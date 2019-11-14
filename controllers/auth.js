/**
 * Titan Ecommerce (Server)
 * controllers/auth.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:22 PM
 * @version 1.0
 */

const oUserModel = require("../models/user");
const oTokenModel = require("../models/emailToken");
const oJwt = require("jsonwebtoken");
const oExpressJwt = require("express-jwt");
const oCrypto = require("crypto");
const oNodeMailer = require("nodemailer");

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
      secure: true,
      pool: true,
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
 * Register User and Send Validation Email
 */
exports.registerUser = (oRequest, oResponse) => {
  const oUser = new oUserModel(oRequest.body);
  oUser.save((oError, oUserData) => {
    if (oError) {
      return oResponse.status(400).json({
        error: oError
      });
    }
    return this.setTokenEmail(oUserData, oRequest, oResponse);
  });
};

/**
 * Sign in user function
 */

exports.signin = (oRequest, oResponse) => {
  const { email, password } = oRequest.body;

  oUserModel.findOne({ email }, (err, user) => {
    if (!user) {
      return oResponse.status(400).json({
        error: "User with that email does not exist. Please sign up."
      });
    }

    if (!user.authenticatePassword(password)) {
      return oResponse
        .status(401)
        .json({ error: "Email and password dont match" });
    }

    const sToken = oJwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    //persist the token as 't' in cookie with expiry date
    oResponse.cookie("t", sToken, { expire: new Date() + 9999 });

    //return response with user and token to frontend client

    const { _id, first_name, last_name, email, role } = user;
    return oResponse.json({
      sToken,
      user: { _id, first_name, last_name, email, role }
    });
  });
};
