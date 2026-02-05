import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../model/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import { Futsal } from '../model/futsal.model.js';
import {generateTimeSlots} from '../utils/availableTimeSlots.js';
import mongoose from 'mongoose';

const createUserAccount = asyncHandler(async (req, res) => {
    const {
        name,
        phoneNumber,
        address
    } = req.body;

    if (!name || !phoneNumber || !address) {
        throw new apiError(400, "All fields are required");
    }

    const user = await User.create({
        name,
        phoneNumber,
        address
    });

    if (!user) {
        throw new apiError(500, "User registration failed");
    }

    req.session.userId = user._id;


 // redirect if user came from /bookFutsal
    if (req.session.redirectTo === '/bookFutsal') {
        delete req.session.redirectTo;
        return res.redirect('/bookFutsal');
    }

    // if normal login
    const allFutsalName = await Futsal.find();

    if (!allFutsalName || allFutsalName.length === 0) {
        throw new apiError(404, "No futsal found");
    }

    return res.status(201).json(
        new apiResponse(201, "user registered successfully", allFutsalName, true)
    )
})


const selectFutsal = asyncHandler(async (req, res) => {
    const {
        futsalUserName,
    } = req.params;

    if (!futsalUserName) {
        throw new apiError(400, "All fields are required");
    }

    const isAdvanceBooking = req.body?.isAdvanceBooking || false;

    const futsal = await Futsal.findOne({ userName: futsalUserName });

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }

    let bookedSlots = futsal.bookedSlots;
    const openingTime = futsal.openTime;
    const closingTime = futsal.closeTime;

    if (!isAdvanceBooking) {
        if (!openingTime || !closingTime || !bookedSlots || !Array.isArray(bookedSlots)) {
            throw new apiError(500, "Invalid futsal data");
        }

        const currenthour = new Date().getHours();

        if (currenthour < (to24Hour(openingTime) - 2) || currenthour > (to24Hour(closingTime) - 1) || currenthour === 23 || currenthour === 0) {
            throw new apiError(400, "Futsal is closed now");
        }
    }
    else {
        bookedSlots = futsal.advanceBookedSlots
    }

    const availableSlots = generateTimeSlots(openingTime, closingTime, bookedSlots);

    return res.status(200).json(
        new apiResponse(200, "Futsal selected successfully", availableSlots, true)
    )

})

const bookFutsal = asyncHandler(async (req, res) => {
    const {
        userId,
        futsalUserName,
        date,
        timeSlot,      // "3PM-4PM",
    } = req.body;

    if (!userId || !futsalUserName || !date || !timeSlot) {
        throw new apiError(400, "All fields are required");
    }

    const formattedDate = date.toISOString().split("T")[0];

    const isAdvanceBooking = req.body?.isAdvanceBooking || false;

    if (isAdvanceBooking) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        const today = todayDate.toISOString().split("T")[0];

        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(todayDate.getDate() + 1);
        const tomorrow = tomorrowDate.toISOString().split("T")[0];

        const dayAfterTomorrowDate = new Date(todayDate);
        dayAfterTomorrowDate.setDate(todayDate.getDate() + 2);
        const dayAfterTomorrow = dayAfterTomorrowDate.toISOString().split("T")[0];

        if (
            formattedDate <= today ||
            (formattedDate !== tomorrow && formattedDate !== dayAfterTomorrow)
        ) {
            throw new apiError(
                400,
                "Booking is allowed only for the next two days.neither did today"
            );
        }
    }

    const session = await mongoose.startSession();

    session.startTransaction();


    try {
        const futsal = await Futsal.findOne({ username: futsalUserName })

        if (!futsal) {
            throw new apiError(400, "Futsal not found ");
        }

        if (!isAdvanceBooking) {
            const isAlreadyBooked = futsal.bookedSlots.some(
                slot => slot.date === formattedDate && slot.time === timeSlot
            );
            if (isAlreadyBooked) {
                throw new apiError(400, "This time slot is already booked");
            }

            futsal.bookedSlots.push({ date: formattedDate, time: timeSlot, user: userId });

        } else {

            const isAlreadyAdvanceBooked = futsal.advanceBookedSlots.some(
                slot => slot.date === formattedDate && slot.time === timeSlot
            );

            if (isAlreadyAdvanceBooked) {
                throw new apiError(400, "This time slot is already booked for advance booking");
            }

            futsal.advanceBookedSlots.push({ date: formattedDate, time: timeSlot, user: userId });
        }

        await futsal.save({ session });

        const user = await User.findById(userId);

        if (!user) {
            throw new apiError(404, "User not found");
        }

        user.bookedDate = formattedDate;
        user.bookedFutsal = futsal._id;
        user.bookedTime = timeSlot;

        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(
            new apiResponse(200, "Futsal booked successfully", futsal, true)
        )
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (!(error instanceof apiError)) {
            //  for checking 
            throw new apiError(500, err.message || "Something went wrong");
        }
        throw error;
    }
})


const userLogin = asyncHandler(async (req, res) => {
    const {
        phoneNumber
    } = req.body

    if (!phoneNumber) {
        throw new apiError(400, "Phone number is required");
    }

    const user = await User.findOne({ phoneNumber }).select('-_id -__v -createdAt -updatedAt');
    if (!user) {
        throw new apiError(404, "User not found");
    }
    return res.status(200).json(
        new apiResponse(200, "User logged in successfully", user, true)
    )
})
export { createUserAccount, selectFutsal, bookFutsal, userLogin }