import express from "express";
import { userLogin, selectFutsal, bookFutsal,createUserAccount } from "../controller/user.controller.js";
import checkUserAccount from "../middleware/userauth.middleware.js";

const router = express.Router();

router.post("/login", userLogin);
router.post("/selectFutsal/:futsalUserName", selectFutsal);
router.post("/bookFutsal",checkUserAccount, bookFutsal);
router.post("/createUserAccount", createUserAccount);


export default router;