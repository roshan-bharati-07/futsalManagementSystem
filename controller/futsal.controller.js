import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { Futsal } from "../model/futsal.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefereshTokens = async (futsalId) => {

    try {
        const futsal = await Futsal.findById(futsalId)

        const accessToken = futsal.generateAccessToken()
        const refreshToken = futsal.generateRefreshToken()

        futsal.refreshToken = refreshToken

        await futsal.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
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

    const existingFutsal = await Futsal.findOne({ userName });

    if (existingFutsal) {
        throw new apiError(400, "Futsal account already exists");
    }

    const file = req.file?.path;        // optional chaining => gives undefined
    console.log(file)

    let image;

    if (file) {

        image = await uploadOnCloudinary(file);
        console.log(image)

        if (!image) {
            throw new apiError(500, "Image upload failed");
        }

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
        closeTime,
        futsalImage: image?.secure_url || ""
    })

    if (!futsal) {
        throw new apiError(500, "Futsal account creation failed");
    }

    return res.status(200).json(
        new apiResponse(200, "Futsal account created successfully", true)
    )
})


const updatePhoto = asyncHandler(async (req, res) => {
    const futsalId = req.futsal._id;
    if (!futsalId) {
        throw new apiError(400, "Futsal ID is required");
    }

    const file = req.file.path;

    if (!file) {
        throw new apiError(400, "No file uploaded");
    }

    const image = await uploadOnCloudinary(file);

    if (!image) {
        throw new apiError(500, "Image upload failed");
    }

    const futsal = await Futsal.findByIdAndUpdate(
        futsalId,
        { futsalImage: image.url },
        { new: true }
    );

    if (!futsal) {
        throw new apiError(500, "Futsal not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Futsal image updated successfully", true)
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
    const isPasswordValid = await futsal.isPasswordMatch(password);
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(futsal._id);

    // options imp for security 
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    }

    return res.status(200).cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .cookie('accessToken', accessToken, options).json(
            new apiResponse(200, "Futsal logged in successfully", {
                accessToken,
                refreshToken
            }, true)
        )

})



const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken


    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const futsal = await Futsal.findById(decodedToken?._id)

        if (!futsal) {
            throw new apiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== futsal?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(futsal._id)

        return res.status(200).cookie('refreshToken', newRefreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .cookie('accessToken', accessToken, options).json(
                new apiResponse(200, "New refreshtoken created successfully", {
                    accessToken,
                    newRefreshToken
                }, true)
            )


    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }

})

const logoutFutsal = asyncHandler(async (req, res) => {

    await Futsal.findByIdAndUpdate(
        req.futsal?._id,   // this we get from the cookies parsed from middleware 
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, "Futsal logged Out"));

})


const bookFutsal = asyncHandler(async (req, res) => {
    const {
        date,
        time
    } = req.body

    const futsalId = req.futsal._id;

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
        new apiResponse(200, "Futsal booked successfully", true)
    )

})

const removeBookedFutsal = asyncHandler(async (req, res) => {
    const {
        date,
        time
    } = req.body;

    const futsalId = req.futsal._id;

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
        new apiResponse(200, "Booked futsal removed successfully", true)
    )

})


const getAllDetails = asyncHandler(async (req, res) => {
    const futsalId = req.futsal._id;

    if (!futsalId) {
        throw new apiError(400, "Futsal ID is required");
    }

    const futsal = await Futsal.findById(futsalId).select('-_id -password -__v -createdAt -updatedAt');

    if (!futsal) {
        throw new apiError(404, "Futsal not found");
    }

    return res.status(200).json(
        new apiResponse(200, "Futsal details fetched successfully", futsal, true)
    )
})


export { createFutsalAccount, bookFutsal, futsalLogin, refreshAccessToken, updatePhoto, removeBookedFutsal, logoutFutsal, getAllDetails }