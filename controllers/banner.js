/**
 * Titan Ecommerce (Server)
 * controllers/banner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oBannerModel = require("../models/banner");
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

exports.createBanner = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    const oBanner = new oBannerModel(oRequest.body);
    oBanner.save((oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        oResponse.json({ data: oData });
    });
};

exports.listBanners = (oRequest, oResponse) => {
    oBannerModel
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

exports.listBannersByVisibility = (oRequest, oResponse) => {
    oBannerModel
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

exports.bannerById = (oRequest, oResponse, oNext, sId) => {
    oBannerModel.findById(sId).exec((oError, oBannerData) => {
        if (oError || !oBannerData) {
            return oResponse.status(400).json({
                error: "Banner not found"
            });
        }
        oRequest.banner = oBannerData;
        oNext();
    });
};

exports.getBannerById = (oRequest, oResponse) => {
    return oResponse.json({ data: oRequest.banner });
};

exports.updateBanner = (oRequest, oResponse) => {
    oRequest = this.setRequestBodyImage(oRequest);
    oBannerModel.findOneAndUpdate(
        { _id: oRequest.banner._id},
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
exports.deleteBanner = (oRequest, oResponse) => {
    oBannerModel.find({'_id': { $in: oRequest.body }})
    .select('_id banner_image')
    .exec((oError, oData) => {
        if (oError || oData.length < 1) {
            return oResponse.status(400).json({
                error: "Banners not found"
            });
        }
        return this.deleteActualBanner(oData, oResponse);
    });
};

/**
 * Delete actual banner
 */
this.deleteActualBanner = (oRequest, oResponse) => {
    var aBannerId = oRequest.map(oItem => oItem._id);
    oBannerModel.deleteMany(
        { _id: { $in: aBannerId } },
        (oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        var aError = this.deleteBannerImage(oRequest);
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
this.deleteBannerImage = (oRequest) => {
    var aError = [];
    oRequest.forEach(oItem => {
        oFileSystem.unlink(`public/images/banners/${oItem.banner_image}`, oError => {
            if (oError) {
                aError.push(oError.message);
            }
        });
    });
    return aError;
};