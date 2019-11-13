/**
 * Titan Ecommerce (Server)
 * models/emailToken.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/13/2019 8:30 PM
 * @version 1.0 
 */

const oMongoose = require('mongoose');

const oTokenEmailSchema = new oMongoose.Schema({
_userId: { 
    type: oMongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
},
token: { 
    type: String, 
    required: true 
},
createdAt: { 
    type: Date, 
    required: true, 
    default: Date.now, 
    expires: 43200 }
}, {timestamps: true});

module.exports = oMongoose.model('TokenEmail', oTokenEmailSchema);