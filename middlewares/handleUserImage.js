/**
 * Titan Ecommerce (Server)
 * middlewares/handleUserImage.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/14/2019 8:19 PM
 * @version 1.0 
 */

const oMulter = require('multer');
const oUuidv1 = require('uuid/v1');

const oStorage = oMulter.diskStorage({
    destination: (oRequest, oFile, oCallback) => {
        oCallback(null, 'public/img/users');
    },
    filename: (oRequest, oFile, oCallback) => {
        const sExtension = oFile.mimetype.split('/')[1];
        oCallback(null, `user-${oUuidv1()}.${sExtension}`)
    }
});

const oFilter = (oRequest, oFile, oCallback) => {
    if (oFile.mimetype.startsWith('image')) {
        oCallback(null, true);
    } else {
        oCallback('Not an image!', false);
    }    
};

const oUpload = oMulter({
    storage: oStorage,
    fileFilter: oFilter
});

exports.uploadImage = (oRequest, oResponse, oNext) => {
    oUpload.single('store_front');
    oUpload.single('company_bir');
    oUpload.single('store_front');
}