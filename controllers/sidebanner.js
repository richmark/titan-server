/**
 * Titan Ecommerce (Server)
 * controllers/banner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oSideBannerModel = require("../models/sidebanner");
const { errorHandler } = require('../helpers/dbErrorHandler');
const oFileSystem = require("fs");

this.setRequestBodyImage = oRequest => {
    if (typeof oRequest.files !== "undefined") {
        Object.keys(oRequest.files).forEach(sKey => {
            oRequest.body[sKey] = oRequest.files[sKey][0].filename;
        });
    }
    return oRequest;
};

exports.createSideBanner = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    const oSideBanner = new oSideBannerModel(oRequest.body);
    oSideBanner.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oResponse.json({ data: oData });
    });
};

exports.listSideBanners = (oRequest, oResponse) => {
    oSideBannerModel
    .find()
    .select()
    .sort([['createdAt', 'desc']])
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    });
};

exports.listSideBannersByVisibility = (oRequest, oResponse) => {
    oSideBannerModel
    .find({ visibility : true })
    .select()
    .sort([['createdAt', 'desc']])
    .exec((oError, oData) => {
      if (oError) {
        return oResponse.status(400).json({
          error: errorHandler(oError)
        });
      }
      oResponse.json({ data: oData });
    });
};

exports.sidebannerById = (oRequest, oResponse, oNext, sId) => {
    oSideBannerModel.findById(sId).exec((oError, oSideBannerData) => {
        if (oError || !oSideBannerData) {
            return oResponse.status(400).json({
                error: "SideBanner not found"
            });
        }
        oRequest.sidebanner = oSideBannerData;
        oNext();
    });
};

exports.getSideBannerById = (oRequest, oResponse) => {
    return oResponse.json({ data: oRequest.sidebanner });
};

exports.updateSideBanner = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    oSideBannerModel.findOneAndUpdate(
        { _id: oRequest.sidebanner._id},
        { $set: oRequest.body },
        { new: true},
        (oError, oData) => {
            if (oError) {
                return oResponse.status(400).json({
                    error: errorHandler(oError)
                });
            }
            oResponse.json({data: oData});
        }
    );
};

/**
 * Find all id first
 */
exports.deleteSideBanner = (oRequest, oResponse) => {
    oSideBannerModel.find({'_id': { $in: oRequest.body }})
    .select('_id banner_image')
    .exec((oError, oData) => {
        if (oError || oData.length < 1) {
            return oResponse.status(400).json({
                error: "SideBanners not found"
            });
        }
        return this.deleteActualSideBanner(oData, oResponse);
    });
};

/**
 * Delete actual banner
 */
this.deleteActualSideBanner = (oRequest, oResponse) => {
    var aSideBannerId = oRequest.map(oItem => oItem._id);
    oSideBannerModel.deleteMany(
        { _id: { $in: aSideBannerId } },
        (oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        var aError = this.deleteSideBannerImage(oRequest);
        if (aError.length > 0) {
            return oResponse
            .status(400)
            .json({ error: "Error in deleting images" }); // refactor, delete first before updating
        }
        oResponse.json({ data: oData });
    });
};

/**
 * Retrieved banner data from find function returns with image file name
 * Image file name would be also deleted
 */
this.deleteSideBannerImage = (oRequest) => {
    var aError = [];
    oRequest.forEach(oItem => {
        oFileSystem.unlink(`public/images/sidebanners/${oItem.side_banner_image}`, oError => {
            if (oError) {
                aError.push(oError.message);
            }
        });
    });
    return aError;
};