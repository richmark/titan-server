/**
 * Titan Ecommerce (Server)
 * helpers/dbErrorHandler.js
 * @author Jon Aguilar <jjaguilar08@gmail.com>
 * @date 11/18/2019
 * @version 1.0
 */

"use strict";

/**
 * Get unique error field name
 */
const buildUniqueMessage = error => {
  let sOutput;
  try {
    let sFieldName = error.message.substring(
      error.message.lastIndexOf(".$") + 2,
      error.message.lastIndexOf("_1")
    );
    sOutput =
      sFieldName.charAt(0).toUpperCase() +
      sFieldName.slice(1) +
      " already exists";
  } catch (oExpection) {
    sOutput = "Unique field already exists";
  }
  return sOutput;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = error => {
  let sMessage = "";

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        sMessage = buildUniqueMessage(error);
        break;
      default:
        sMessage = "Something went wrong";
    }
  } else {
    for (let sErrorName in error.errors) {
      if (error.errors[sErrorName].message)
        sMessage = error.errors[errorName].message;
    }
  }
  return sMessage;
};
