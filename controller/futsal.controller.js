import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { Futsal } from "../model/futsal.model.js";
import jwt from "jsonwebtoken";

const generateRefreshToken = async (futsalId) => {
    try {
        const futsal = await Futsal.findById(futsalId);
        if (!futsal) {
            throw new apiError(404, "Futsal not found");
        }
        const refreshToken = futsal.generateRefreshToken();
        futsal.refreshToken = refreshToken;
        await futsal.save({ validateBeforeSave: false });
        return refreshToken;
    } catch (error) {
        throw new apiError(500, "Could not generate refresh token");
    }
}


const createFutsalAccount = asyncHandler(async (req, res) => {
    const {
        name,
        userName,
        password,
        address,
        ownerName,
        phone,
        email,
        openTime,
        closeTime
    } = req.body;

    if (!name || !userName || !password || !address || !ownerName || !phone || !email || !openTime || !closeTime) {
        throw new apiError(400, "All fields are required");
    }

    const futsal = await Futsal.create({
        name,
        userName,
        password,
        address,
        ownerName,
        phone,
        email,
        openTime,
        closeTime
    })

    if (!futsal) {
        throw new apiError(500, "Futsal account creation failed");
    }

    return res.status(200).json(
        new apiResponse(200, "Futsal account created successfully", futsal, true)
    )
})


const futsalLogin = asyncHandler(async (req, res) => {
    const {
        userName,
        password
    } = req.body;

    if (!userName || !password) {
        throw new apiError(400, "All fields are required");
    }
    const futsal = await Futsal.findOne({ userName })

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }
    const isPasswordValid = await futsal.comparePassword(password);
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password");
    }
    const refreshToken = await generateRefreshToken(futsal._id);

    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie('refreshToken', refreshToken, options).json(
        new apiResponse(200, "Futsal logged in successfully", true) 
    )
    
})


const bookFutsal = asyncHandler(async (req, res) => {
    const {
        futsalId,
        date,
        time
    } = req.body


    if (!futsalId || !date || !time) {
        throw new apiError(400, "All fields are required");
    }

    const futsal = await Futsal.findById(futsalId);

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }

    const isBookedInConfirmed = futsal.bookedSlots.some(
        slot => slot.date === date && slot.time === time
    );

    const isBookedInAdvance = futsal.advanceBookedSlots.some(
        slot => slot.date === date && slot.time === time
    );

    if (isBookedInConfirmed || isBookedInAdvance) {
        throw new apiError(400, "This slot is already booked");
    }

    futsal.bookedSlots.push({ date, time });
    await futsal.save();

    return res.status(200).json(
        new apiResponse(200, "Futsal booked successfully", futsal, true)
    )

})

const removeBookedFutsal = asyncHandler(async (req, res) => {
    const {
        futsalId,
        date,
        time
    } = req.body;

    if (!futsalId || !date || !time) {
        throw new apiError(400, "All fields are required");
    }

    const futsal = await Futsal.findById(futsalId);

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }

    futsal.bookedSlots = futsal.bookedSlots.filter(
        slot => !(slot.date === date && slot.time === time)
    );

    await futsal.save();

    return res.status(200).json(
        new apiResponse(200, "Booked futsal removed successfully", futsal, true)
    )

})

const getAllDetails = asyncHandler(async (req, res) => {
    const {
        futsalId
    } = req.body

    if (!futsalId) {
        throw new apiError(400, "Futsal ID is required");
    }

    const futsal = await Futsal.findById(futsalId).select('-password -__v -createdAt -updatedAt');

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Futsal details fetched successfully", futsal, true)
    )
})


export { createFutsalAccount, bookFutsal, removeBookedFutsal, getAllDetails }