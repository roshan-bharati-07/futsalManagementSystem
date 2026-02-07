import express from "express";
import { userLogin, selectFutsal, bookFutsal,createUserAccount } from "../controller/user.controller.js";
import checkUserAccount from "../middleware/userauth.middleware.js";

const router = express.Router();

router.post("/login", userLogin);
router.post("/selectFutsal/:futsalId", selectFutsal);
// router.post("/bookFutsal/:userId/:futsalId",checkUserAccount, bookFutsal);
router.post("/bookFutsal/:userId/:futsalId", bookFutsal);
router.post("/createUserAccount", createUserAccount);


export default router;