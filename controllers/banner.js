/**
 * Titan Ecommerce (Server)
 * controllers/banner.js
 * @author Richmark Jinn Ravina <richmark.jinn.ravina@gmail.com>
 * @date 02/10/2020 7:26 PM
 * @version 1.0
 */

const oBannerModel = require("../models/banner");
const { errorHandler } = require('../helpers/dbErrorHandler');

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
 * TODO: delete images on images/banner/
 */
exports.deleteBanner = (oRequest, oResponse) => {
    oBannerModel.deleteMany({ _id: { $in: oRequest.body}}, (oError, oData) => {
        if (oError) {
            return oResponse.status(400).json({
                error: errorHandler(oError)
            });
        }
        console.log(oData);
        oResponse.json({data: oData});
    });
};