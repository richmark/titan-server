/**
 * Titan Ecommerce (Server)
 * models/user.js
 * @author Carlo Barcena <cbarcena20@gmail.com>
 * @date 11/12/2019 8:28 PM
 * @version 1.0
 */

const oMongoose = require('mongoose');
const oCrypto = require('crypto');
const oUuidv1 = require('uuid/v1');

/**
 * User Schema
 */
const oUserSchema = new oMongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        first_name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50
        },
        last_name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50
        },
        mobile_number: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50
        },
        address: {
            type: String,
            trim: true,
            required: true,
            maxlength: 65000
        },
        company_name: {
            type: String,
            trim: true,
            maxlength: 50
        },
        tin: {
            type: String,
            trim: true,
            maxlength: 50
        },
        store_front: {
            type: String,
            trim: true,
            maxlength: 255
        },
        company_bir: {
            type: String,
            trim: true,
            maxlength: 255
        },
        mayor_permit: {
            type: String,
            trim: true,
            maxlength: 255
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        role: {
            type: Number,
            required: true
        },
        verified_email: {
            type: Boolean,
            default: false
        },
        verified_admin: {
            type: Boolean,
            default: false
        },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        passwordChangedAt: { type: Date }
    },
    { timestamps: true }
);

/**
 * Virtual Field
 */
oUserSchema
    .virtual('password')
    .set(function(sPassword) {
        this._password = sPassword;
        this.salt = oUuidv1();
        this.hashed_password = this.encryptPassword(sPassword);
    })
    .get(function() {
        return this._password;
    });

oUserSchema.methods = {
    authenticatePassword: function(sPassword) {
        return this.encryptPassword(sPassword) === this.hashed_password;
    },

    encryptPassword: function(sPassword) {
        if (!sPassword === true) {
            return '';
        }
        try {
            return oCrypto
                .createHmac('sha1', this.salt)
                .update(sPassword)
                .digest('hex');
        } catch (oError) {
            return '';
        }
    },

    createPasswordResetToken: function() {
        const sResetToken = oCrypto.randomBytes(32).toString('hex');
        this.passwordResetToken = oCrypto
            .createHash('sha256')
            .update(sResetToken)
            .digest('hex');
        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        console.log(sResetToken, this.passwordResetToken);
        return sResetToken;
    }
};

oUserSchema.pre('save', function(oCallBack) {
    if (!this.isModified('hashed_password') || this.isNew) return oCallBack();
    this.passwordChangedAt = Date.now();
    oCallBack();
});

module.exports = oMongoose.model('User', oUserSchema);
