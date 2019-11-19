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
        oCallback(null, 'public/images/users');
    },
    filename: (oRequest, oFile, oCallback) => {
        console.log(oFile);
        const sExtension = oFile.mimetype.split('/')[1];
        const sId = `user-${oRequest.profile._id}-${oFile.fieldname}.${sExtension}`;
        oCallback(null, sId);
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

exports.uploadImage = oUpload.fields([
    {name: 'company_bir'},
    {name: 'mayor_permit'},
    {name: 'store_front'}
]);

exports.createFileArray = (oRequest, oResponse, oNext) => {
    oRequest.file = [];
    oNext();
};