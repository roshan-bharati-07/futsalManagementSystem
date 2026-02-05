import express from "express";
import {
    createFutsalAccount,
    futsalLogin,
    bookFutsal,
    removeBookedFutsal,
    getAllDetails,
    updatePhoto,
    refreshAccessToken,
    logoutFutsal
} from "../controller/futsal.controller.js";

import { createQRcode } from "../controller/qr.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router.post("/register", upload.single('file'), createFutsalAccount);
router.post("/login", futsalLogin);
router.post("/book", authMiddleware, bookFutsal);
router.post("/removeBookedFutsal", authMiddleware, removeBookedFutsal);
router.get("/getAllDetails", authMiddleware, getAllDetails);
router.patch("/updatePhoto", authMiddleware, upload.single('file'), updatePhoto);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authMiddleware, logoutFutsal);
router.post("/createQRcode/:username", createQRcode);

export default router;