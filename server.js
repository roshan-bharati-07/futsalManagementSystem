import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiResponse from "./utils/apiResponse.js";
import session from 'express-session';

// routes 
import futsalRoutes from "./routes/futsal.route.js";
import userRoutes from "./routes/user.route.js";    

// import db 
import connectDB from "./db/futsal.db.js";

// job 
import "./job/dailyBooking.job.js";

import { User } from "./model/user.model.js";
import { Futsal } from "./model/futsal.model.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

try {
    connectDB();
} catch (error) {
    console.log("Error connecting to database:", error);
    process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);


app.use(cors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,

    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

// routes 
app.use("/futsal", futsalRoutes);4
app.use("/user", userRoutes);

app.post('/delete-All', async (req,res) =>{
const user = await User.deleteMany()

return res.status(200).json(
    new apiResponse(200, "User deleted successfully", user, true)
)
})

app.post('/delete-All-futsal', async (req,res) =>{
const user = await Futsal.deleteMany()

return res.status(200).json(
    new apiResponse(200, "Futsal deleted successfully", user, true)
)
})




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});