import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    role: {
        type: String,
        default: 'user'
    },
    name: {
        type:String,
        trim:true,
        lowercase:true,
        required:true
    },
    phoneNumber: {
        type:String,
        trim:true,
        unique:true,
        required:true
    },
    address: {
        type:String,
        trim:true,
        required:true
    },
    bookedDate: {
        type: Date,
        required: true,
    },
    bookedFutsal: {
        type:Schema.Types.ObjectId,
        ref: 'Futsal',
        required: true
    }, 
    bookedTime: {
        type: String,
        required: true,
    },
    advanceBooking: [{
        date: {
            type: String,
            required: true, 
        },
        time: {
            type: String,
            required: true,
        },   
        futsalName: {
            type:Schema.Types.ObjectId,
            ref: 'Futsal',
            required: true
        }
    }]
    
}, {
    timestamps:true
})

export const User = mongoose.model('User', userSchema);