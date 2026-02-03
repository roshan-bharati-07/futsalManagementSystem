import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

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
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    }],

    advanceBookedSlots: [{
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],
    refreshToken:{
        type:String
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

// ensure subdocument holds unique date and time 
futsalSchema.index({ "bookedSlots.date": 1, "bookedSlots.time": 1 }, { unique: true })

futsalSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

futsalSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
}

export const Futsal = mongoose.model('Futsal', futsalSchema);

