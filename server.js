import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes 
import futsalRoutes from "./routes/futsal.route.js";
import userRoutes from "./routes/user.route.js";    

// import db 
import connectDB from "./db/futsal.db.js";

// job 
import "./job/dailyBooking.job.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

try {
    connectDB();
} catch (error) {
    console.log("Error connecting to database:", error);
    process.exit(1);
}

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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});