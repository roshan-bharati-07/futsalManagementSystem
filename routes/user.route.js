import express from "express";
import { userLogin, selectFutsal, bookFutsal,createUserAccount } from "../controller/user.controller.js";

const router = express.Router();

router.post("/login", userLogin);
router.post("/selectFutsal", selectFutsal);
router.post("/bookFutsal", bookFutsal);
router.post("/createUserAccount", createUserAccount);


export default router;