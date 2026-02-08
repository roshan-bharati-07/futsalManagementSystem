import QRCode from "qrcode";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";


const createQRcode = asyncHandler(async(req,res) => {

    const {
        futsalId
    } = req.params

    console.log(futsalId)

    if (!futsalId ) {
        throw new apiError(400, "Futsal username is required");
    }

    // const endpoint = `http://localhost:300/${encodeURIComponent(futsalId)}`  // replace it with deployed url 
    const endpoint = `https://caron-noncomical-unmelancholically.ngrok-free.dev/user/selectFutsal/${encodeURIComponent(futsalId)}`  // replace it with deployed url 

    const qrCode = await QRCode.toDataURL(endpoint);
    
    return res.status(200).json(
        new apiResponse(200, "QR code generated successfully", qrCode, true)
    )

})


export { createQRcode }