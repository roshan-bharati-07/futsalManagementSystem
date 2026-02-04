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

import { authFutsal } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = express.Router();

router.post("/register", upload.single('file'), createFutsalAccount);
router.post("/login", futsalLogin);
router.post("/book", authFutsal, bookFutsal);
router.post("/removeBookedFutsal", authFutsal, removeBookedFutsal);
router.get("/getAllDetails", authFutsal, getAllDetails);
router.patch("/updatePhoto", authFutsal, upload.single('file'), updatePhoto);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authFutsal, logoutFutsal);

export default router;