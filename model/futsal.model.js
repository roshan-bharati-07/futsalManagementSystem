import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const futsalSchema = new Schema({
    role: {
        type: String,
        default: 'futsal'
    },
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true

    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    openTime: {
        type: String,
        required: true,
        trim: true
    },
    closeTime: {
        type: String,
        required: true,
        trim: true
    },
    bookedSlots: [{
        date: {
            type: String,
            trim:true
        },
        time: {
            type: String,
            trim:true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    }],

    advanceBookedSlots: [{
        date: {
            type: String,
             trim:true
        },
        time: {
            type: String,
            trim:true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            
        }
    }],

    availableSlots: [{
        type:String
    }],
    accessToken: {
        type:String
    },
    refreshToken:{
        type:String
    },
    futsalImage: {
        type: String,
        default: ""
    }

}, { timestamps: true });

// refresh token 
futsalSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

futsalSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.userName,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}


futsalSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});


futsalSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
}

export const Futsal = mongoose.model('Futsal', futsalSchema);

