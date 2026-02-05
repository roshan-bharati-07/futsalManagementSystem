import QRCode from "qrcode";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";


const createQRcode = asyncHandler(async(req,res) => {

    const {
        futsalUsername
    } = req.params

    if (!futsalUsername ) {
        throw new apiError(400, "Futsal username is required");
    }

    const endpoint = `http://localhost:300/${encodeURIComponent(username)}`

    const qrCode = await QRCode.toDataURL(endpoint);
    
    return res.status(200).json(
        new apiResponse(200, "QR code generated successfully", qrCode, true)
    )

})


export { createQRcode }