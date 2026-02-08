import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    role: {
        type: String,
        default: 'user'
    },
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    bookedDate: {
        type: Date,
    },
    bookedFutsal: {
        type: Schema.Types.ObjectId,
        ref: 'Futsal',
    },
    bookedTime: {
        type: String,
    },
    advanceBooking: {                   //if want to use array, use $each 
        date: {
            type: String,
        },
        time: {
            type: String,
        },
        futsalId: {
            type: Schema.Types.ObjectId,
            ref: 'Futsal',
        }
    }

}, {
    timestamps: true
})

export const User = mongoose.model('User', userSchema);