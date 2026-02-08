import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../model/user.model.js';
import apiResponse from '../utils/apiResponse.js';
import { Futsal } from '../model/futsal.model.js';
import { generateTimeSlots } from '../utils/availableTimeSlots.js';
import mongoose from 'mongoose';
import {
    to24Hour
} from '../utils/hour.js';
import { findTommorowAndAfterDate } from '../utils/date.js';

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

    console.log("request session controller")
    console.log(req.session.userId)

    // redirect if user came from /bookFutsal
    if (req.session.redirectTo === '/bookFutsal') {
        delete req.session.redirectTo;
        return res.redirect('/bookFutsal');
    }

    // if normal login
    const allFutsalName = await Futsal.find().select('name');

    if (!allFutsalName || allFutsalName.length === 0) {
        throw new apiError(404, "No futsal found");
    }


    return res.status(201).json(
        new apiResponse(201, "user registered successfully", { allFutsalName, userId: user._id }, true)
    )
})


const selectFutsal = asyncHandler(async (req, res) => {
    const {
        futsalId
    } = req.params;

    if (!futsalId) {
        throw new apiError(400, "All fields are required");
    }

    const isAdvanceBooking = req.body?.isAdvanceBooking || false;

    const futsal = await Futsal.findById(futsalId);

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

    futsal.availableSlots = availableSlots

    await futsal.save();


    return res.status(200).json(
        new apiResponse(200, "Futsal selected successfully", availableSlots)
    )

})

const bookFutsal = asyncHandler(async (req, res) => {

    const {
        userId,
        futsalId
    } = req?.params

    if (!userId || !futsalId) {
        throw new apiError(400, "All Ids are required");
    }

    const {
        inputDate,
        timeSlot,
        isAdvanceBooking
    } = req?.query

    const inputHour = timeSlot.split("-")[0].trim();

    console.log("inputDate", inputDate)
    console.log("timeSlot", timeSlot)
    console.log("isAdvanceBooking", isAdvanceBooking)

    if (!userId || !futsalId || !inputDate || !timeSlot) {
        throw new apiError(400, "All fields are required");
    }

    const validation = ["true", "false"];

    if (!validation.includes(isAdvanceBooking)) {
        throw new apiError(400, "Invalid isAdvanceBooking value");
    }

    // user send date
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }
    const formattedDate = date.toISOString().split("T")[0];    // to check this 

    // tomorrow and after date
    const {
        todayDate,
        tommorowDate,
        afterTommorowDate,
        currentHour
    } = findTommorowAndAfterDate();


    // check validation if isAdvanceBooking = true 
    if (isAdvanceBooking === "true") {

        const allowed = [tommorowDate, afterTommorowDate];

        if (!allowed.includes(formattedDate)) {
            throw new apiError(
                400,
                "Booking is allowed only for the next two days.neither did today"
            );
        }
    }

    const session = await mongoose.startSession();

    session.startTransaction();


    try {
        const futsal = await Futsal.findById(futsalId);

        if (!futsal) {
            throw new apiError(400, "Futsal not found ");
        }

        // if isAdvanceBooking = false => adding in bookedSlots 
        if (isAdvanceBooking === "false") {
            
            console.log("ajha lai booking")

            if (currentHour != inputHour) {
                throw new apiError(400, "Invalid time slot");
            }


            if (formattedDate != todayDate) {
                throw new apiError(400, "invalid Booking date");
            }


            if (!futsal.availableSlots.includes(timeSlot)) {
                throw new apiError(400, "This time slot is not available");
            }


            const isAlreadyBooked = futsal.bookedSlots.some(
                slot => slot.date === formattedDate && slot.time === timeSlot
            );

            if (isAlreadyBooked) {
                throw new apiError(400, "This time slot is already booked");
            }

            futsal.bookedSlots.push({ date: formattedDate, time: timeSlot, user: userId });

        }
        // if isAdvanceBooking = true => adding in advanceBookedSlots
        else {
            console.log("advance booking garya")
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

        console.log("user ma update hunxa yeta bata ")


        // adding in advanceBooke Section of user 
        if (isAdvanceBooking === "true") {
            user.advanceBooking.date= formattedDate;
            user.advanceBooking.futsalId = futsal._id;
            user.advanceBooking.time= timeSlot;
        }
        else {
            user.bookedDate = formattedDate;
            user.bookedFutsal = futsal._id;
            user.bookedTime = timeSlot;
        }
        await user.save({ session });

        // now update the available slot 
        futsal.availableSlots = futsal.availableSlots.filter(slot => slot !== timeSlot);
        await futsal.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(
            new apiResponse(200, "Futsal booked successfully", true)
        )

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (!(error instanceof apiError)) {
            //  for checking 
            throw new apiError(500, error.message || "Something went wrong");
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