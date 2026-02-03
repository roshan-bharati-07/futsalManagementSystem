import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiRepsonse from "../utils/apiResponse.js";
import { Futsal } from "../model/futsal.model.js";


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
        new apiRepsonse(200, "Futsal account created successfully", futsal, true)
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
        new apiRepsonse(200, "Futsal booked successfully", futsal, true)
    )

})