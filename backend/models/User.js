const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: false,
            select: false
        },

        // Google Authentication
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },

        // Password Reset Fields
        resetPasswordToken: {
            type: String,
            default: undefined,
            select: false
        },

        resetPasswordExpires: {
            type: Date,
            default: undefined,
            select: false
        }
    },
    {
        timestamps: true,

        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toString();

                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.googleId;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpires;

                return ret;
            }
        }
    }
);

module.exports = mongoose.model("User", userSchema);